import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { isNightBlocked, nightsBetween } from "@/lib/booking";
import { ownerDemoEnabled } from "@/lib/owner-config";
import { pg, usePostgres } from "@/lib/owner-pg";
import { seedCleaningsForSlug, seedStaysForSlug } from "@/lib/owner-seed";
import { getOwnerBlockedRanges, removeOwnerNight } from "@/lib/owner-store";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

const STAYS_PATH = path.join(process.cwd(), "data", "owner-stays.json");
const CLEANINGS_PATH = path.join(process.cwd(), "data", "owner-cleanings.json");

function isoDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function isoStamp(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function parsePhotos(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((item): item is string => typeof item === "string");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function rowToStay(row: Record<string, unknown>): PaidStay {
  return {
    id: String(row.id),
    slug: String(row.slug),
    guestKey: String(row.guest_key || "guest"),
    guestLabel: String(row.guest_label || ""),
    checkIn: isoDate(row.check_in),
    checkOut: isoDate(row.check_out),
    guests: Number(row.guests) || 1,
    status: "paid",
    checkedInAt: isoStamp(row.checked_in_at),
    checkedOutAt: isoStamp(row.checked_out_at),
    checkedInBy: String(row.checked_in_by || ""),
    checkedOutBy: String(row.checked_out_by || ""),
    checkInTime: String(row.check_in_time || ""),
    checkOutTime: String(row.check_out_time || ""),
    checkInPhotos: parsePhotos(row.checkin_photos_json),
    checkOutPhotos: parsePhotos(row.checkout_photos_json),
    bookedBy: parseBookedBy(row.booked_by),
  };
}

function parseBookedBy(raw: unknown): PaidStay["bookedBy"] {
  const value = String(raw ?? "");
  if (value === "owner" || value === "ops" || value === "site") return value;
  return "ops";
}

function normalizeFileStay(stay: PaidStay): PaidStay {
  return { ...stay, bookedBy: parseBookedBy(stay.bookedBy) };
}

function staysOverlap(a: { checkIn: string; checkOut: string }, b: { checkIn: string; checkOut: string }) {
  return a.checkIn < b.checkOut && b.checkIn < a.checkOut;
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function getStaysForSlug(slug: string): Promise<PaidStay[]> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`
      SELECT id, slug, guest_key, guest_label, check_in, check_out, guests, checked_in_at, checked_out_at,
             checkin_photos_json, checkout_photos_json, checked_in_by, checked_out_by, check_in_time, check_out_time,
             booked_by
      FROM owner_stays WHERE slug = ${slug} ORDER BY check_in
    `;
    return (rows as Record<string, unknown>[]).map(rowToStay);
  }
  const file = await readJsonFile<{ stays: PaidStay[] }>(STAYS_PATH, { stays: [] });
  const local = file.stays.filter((stay) => stay.slug === slug).map(normalizeFileStay);
  if (local.length) return local;
  return ownerDemoEnabled() ? seedStaysForSlug(slug) : [];
}

export async function getStayById(id: string): Promise<PaidStay | null> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`
      SELECT id, slug, guest_key, guest_label, check_in, check_out, guests, checked_in_at, checked_out_at,
             checkin_photos_json, checkout_photos_json, checked_in_by, checked_out_by, check_in_time, check_out_time,
             booked_by
      FROM owner_stays WHERE id = ${id} LIMIT 1
    `;
    const row = rows[0] as Record<string, unknown> | undefined;
    return row ? rowToStay(row) : null;
  }
  const file = await readJsonFile<{ stays: PaidStay[] }>(STAYS_PATH, { stays: [] });
  const found = file.stays.find((stay) => stay.id === id);
  return found ? normalizeFileStay(found) : null;
}

export async function createManualStay(input: {
  slug: string;
  guestLabel: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  bookedBy: "owner" | "ops";
}): Promise<PaidStay | { error: "overlap" | "invalid" }> {
  const guestLabel = input.guestLabel.trim().slice(0, 80);
  if (!guestLabel || input.checkOut <= input.checkIn || input.guests < 1) {
    return { error: "invalid" };
  }
  const existing = await getStaysForSlug(input.slug);
  const next: PaidStay = {
    id: randomBytes(8).toString("hex"),
    slug: input.slug,
    guestKey: "guest",
    guestLabel,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    status: "paid",
    checkedInAt: null,
    checkedOutAt: null,
    bookedBy: input.bookedBy,
  };
  if (existing.some((stay) => staysOverlap(stay, next))) return { error: "overlap" };

  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO owner_stays (id, slug, guest_key, guest_label, check_in, check_out, guests, booked_by)
      VALUES (
        ${next.id},
        ${next.slug},
        ${next.guestKey},
        ${next.guestLabel},
        ${next.checkIn},
        ${next.checkOut},
        ${next.guests},
        ${next.bookedBy}
      )
    `;
  } else {
    const file = await readJsonFile<{ stays: PaidStay[] }>(STAYS_PATH, { stays: [] });
    file.stays.push(next);
    await writeJsonFile(STAYS_PATH, file);
  }

  const blocks = await getOwnerBlockedRanges(input.slug);
  for (const night of nightsBetween(input.checkIn, input.checkOut)) {
    if (isNightBlocked(night, blocks)) await removeOwnerNight(input.slug, night);
  }
  return next;
}

export async function deleteStay(id: string, slug: string): Promise<boolean> {
  const stay = await getStayById(id);
  if (!stay || stay.slug !== slug) return false;
  if (usePostgres()) {
    const sql = await pg();
    await sql`DELETE FROM owner_stays WHERE id = ${id} AND slug = ${slug}`;
    return true;
  }
  const file = await readJsonFile<{ stays: PaidStay[] }>(STAYS_PATH, { stays: [] });
  file.stays = file.stays.filter((item) => item.id !== id);
  await writeJsonFile(STAYS_PATH, file);
  return true;
}

export async function markStayCheck(
  id: string,
  slug: string,
  kind: "in" | "out",
  extra?: { by?: string; time?: string },
): Promise<PaidStay | null> {
  const stay = await getStayById(id);
  if (!stay || stay.slug !== slug) return null;
  const now = new Date().toISOString();
  const by = (extra?.by ?? "").trim().slice(0, 80);
  const time = (extra?.time ?? "").trim();
  if (kind === "in") {
    stay.checkedInAt = now;
    stay.checkedInBy = by;
    stay.checkInTime = time;
  } else {
    stay.checkedOutAt = now;
    stay.checkedOutBy = by;
    stay.checkOutTime = time;
  }

  if (usePostgres()) {
    const sql = await pg();
    if (kind === "in") {
      await sql`
        UPDATE owner_stays
        SET checked_in_at = NOW(), checked_in_by = ${by}, check_in_time = ${time}
        WHERE id = ${id} AND slug = ${slug}
      `;
    } else {
      await sql`
        UPDATE owner_stays
        SET checked_out_at = NOW(), checked_out_by = ${by}, check_out_time = ${time}
        WHERE id = ${id} AND slug = ${slug}
      `;
    }
    return getStayById(id);
  }
  const file = await readJsonFile<{ stays: PaidStay[] }>(STAYS_PATH, { stays: [] });
  const idx = file.stays.findIndex((item) => item.id === id);
  if (idx >= 0) file.stays[idx] = stay;
  await writeJsonFile(STAYS_PATH, file);
  return stay;
}

export async function addStayPhotos(
  id: string,
  slug: string,
  kind: "in" | "out",
  photos: string[],
): Promise<PaidStay | null> {
  const stay = await getStayById(id);
  if (!stay || stay.slug !== slug) return null;
  const clean = photos.filter((item) => item.startsWith("data:image/") && item.length < 450_000).slice(0, 8);
  if (!clean.length) return stay;
  if (kind === "in") stay.checkInPhotos = [...(stay.checkInPhotos ?? []), ...clean].slice(0, 12);
  else stay.checkOutPhotos = [...(stay.checkOutPhotos ?? []), ...clean].slice(0, 12);

  if (usePostgres()) {
    const sql = await pg();
    const json = JSON.stringify(kind === "in" ? stay.checkInPhotos : stay.checkOutPhotos);
    if (kind === "in") {
      await sql`UPDATE owner_stays SET checkin_photos_json = ${json} WHERE id = ${id} AND slug = ${slug}`;
    } else {
      await sql`UPDATE owner_stays SET checkout_photos_json = ${json} WHERE id = ${id} AND slug = ${slug}`;
    }
    return getStayById(id);
  }
  const file = await readJsonFile<{ stays: PaidStay[] }>(STAYS_PATH, { stays: [] });
  const idx = file.stays.findIndex((item) => item.id === id);
  if (idx >= 0) file.stays[idx] = stay;
  await writeJsonFile(STAYS_PATH, file);
  return stay;
}

function rowToCleaning(row: Record<string, unknown>): CleaningRecord {
  let photos: string[] = [];
  try {
    photos = JSON.parse(String(row.photos_json || "[]")) as string[];
  } catch {
    photos = [];
  }
  return {
    id: String(row.id),
    slug: String(row.slug),
    stayId: String(row.stay_id || ""),
    date: isoDate(row.date),
    time: String(row.time),
    cleanerId: String(row.cleaner_id || ""),
    notes: String(row.notes || ""),
    photos,
  };
}

export async function getCleaningById(id: string): Promise<CleaningRecord | null> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`
      SELECT id, slug, stay_id, date, time, cleaner_id, notes, photos_json
      FROM owner_cleanings WHERE id = ${id} LIMIT 1
    `;
    const row = rows[0] as Record<string, unknown> | undefined;
    return row ? rowToCleaning(row) : null;
  }
  const file = await readJsonFile<{ cleanings: CleaningRecord[] }>(CLEANINGS_PATH, { cleanings: [] });
  const local = file.cleanings.find((row) => row.id === id);
  if (local) return local;
  if (!ownerDemoEnabled()) return null;
  const { SEED_CLEANINGS } = await import("@/lib/owner-seed");
  return SEED_CLEANINGS.find((row) => row.id === id) ?? null;
}

export async function getCleaningsForSlug(slug: string): Promise<CleaningRecord[]> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`
      SELECT id, slug, stay_id, date, time, cleaner_id, notes, photos_json
      FROM owner_cleanings WHERE slug = ${slug} ORDER BY date DESC
    `;
    return (rows as Record<string, unknown>[]).map(rowToCleaning);
  }
  const file = await readJsonFile<{ cleanings: CleaningRecord[] }>(CLEANINGS_PATH, { cleanings: [] });
  const local = file.cleanings.filter((row) => row.slug === slug);
  if (local.length) return local;
  return ownerDemoEnabled() ? seedCleaningsForSlug(slug) : [];
}

export async function createCleaning(input: {
  slug: string;
  stayId?: string;
  date: string;
  time: string;
  cleanerName: string;
  notes: string;
  photos?: string[];
}): Promise<CleaningRecord | { error: "invalid" }> {
  const date = input.date.trim();
  const time = input.time.trim() || "10:00";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "invalid" };
  const photos = (input.photos ?? [])
    .filter((item) => item.startsWith("data:image/") && item.length < 450_000)
    .slice(0, 8);
  const record: CleaningRecord = {
    id: randomBytes(8).toString("hex"),
    slug: input.slug,
    stayId: input.stayId?.trim() || "",
    date,
    time,
    cleanerId: input.cleanerName.trim().slice(0, 80) || "équipe",
    notes: input.notes.trim().slice(0, 500),
    photos,
  };
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO owner_cleanings (id, slug, stay_id, date, time, cleaner_id, notes, photos_json)
      VALUES (
        ${record.id},
        ${record.slug},
        ${record.stayId},
        ${record.date},
        ${record.time},
        ${record.cleanerId},
        ${record.notes ?? ""},
        ${JSON.stringify(record.photos)}
      )
    `;
    return record;
  }
  const file = await readJsonFile<{ cleanings: CleaningRecord[] }>(CLEANINGS_PATH, { cleanings: [] });
  file.cleanings.push(record);
  await writeJsonFile(CLEANINGS_PATH, file);
  return record;
}
