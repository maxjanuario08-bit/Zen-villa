import { ownerDemoEnabled } from "@/lib/owner-config";
import { pg, usePostgres } from "@/lib/owner-pg";
import { seedCleaningsForSlug, seedStaysForSlug } from "@/lib/owner-seed";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

function isoDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export async function getStaysForSlug(slug: string): Promise<PaidStay[]> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`
      SELECT id, slug, guest_key, guest_label, check_in, check_out, guests
      FROM owner_stays WHERE slug = ${slug} ORDER BY check_in
    `;
    if (rows.length) {
      return (rows as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        slug: String(row.slug),
        guestKey: String(row.guest_key || "guest"),
        guestLabel: String(row.guest_label || ""),
        checkIn: isoDate(row.check_in),
        checkOut: isoDate(row.check_out),
        guests: Number(row.guests) || 1,
        status: "paid" as const,
      }));
    }
  }
  return ownerDemoEnabled() ? seedStaysForSlug(slug) : [];
}

export async function getCleaningById(id: string): Promise<CleaningRecord | null> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`
      SELECT id, slug, stay_id, date, time, cleaner_id, notes, photos_json
      FROM owner_cleanings WHERE id = ${id} LIMIT 1
    `;
    const row = rows[0] as Record<string, unknown> | undefined;
    if (row) {
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
        cleanerId: String(row.cleaner_id || "marie"),
        notes: String(row.notes || ""),
        photos,
      };
    }
  }
  const { SEED_CLEANINGS } = await import("@/lib/owner-seed");
  if (!ownerDemoEnabled()) return null;
  return SEED_CLEANINGS.find((row) => row.id === id) ?? null;
}

export async function getCleaningsForSlug(slug: string): Promise<CleaningRecord[]> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`
      SELECT id, slug, stay_id, date, time, cleaner_id, notes, photos_json
      FROM owner_cleanings WHERE slug = ${slug} ORDER BY date
    `;
    if (rows.length) {
      return (rows as Record<string, unknown>[]).map((row) => {
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
          cleanerId: String(row.cleaner_id || "marie"),
          notes: String(row.notes || ""),
          photos,
        };
      });
    }
  }
  return ownerDemoEnabled() ? seedCleaningsForSlug(slug) : [];
}
