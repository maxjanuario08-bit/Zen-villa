import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { createManualStay } from "@/lib/owner-data";
import { pg, usePostgres } from "@/lib/owner-pg";
import type { PendingBooking } from "@/lib/owner-types";

const STORE_PATH = path.join(process.cwd(), "data", "pending-bookings.json");

function isoDate(value: unknown) {
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : String(value).slice(0, 10);
}

function rowToPending(row: Record<string, unknown>): PendingBooking {
  return {
    id: String(row.id),
    slug: String(row.slug),
    guestLabel: String(row.guest_label || ""),
    guestEmail: String(row.guest_email || ""),
    guestPhone: String(row.guest_phone || ""),
    checkIn: isoDate(row.check_in),
    checkOut: isoDate(row.check_out),
    guests: Number(row.guests) || 1,
    amount: Number(row.amount) || 0,
    status: row.status === "paid" || row.status === "canceled" ? row.status : "pending",
    stayId: String(row.stay_id || ""),
    createdAt: String(row.created_at || ""),
  };
}

async function readFile(): Promise<PendingBooking[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as { bookings?: PendingBooking[] };
    return parsed.bookings ?? [];
  } catch {
    return [];
  }
}

async function writeFile(bookings: PendingBooking[]) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, `${JSON.stringify({ bookings }, null, 2)}\n`, "utf8");
}

export async function createPendingBooking(input: {
  slug: string;
  guestLabel: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
}): Promise<PendingBooking> {
  const next: PendingBooking = {
    id: randomBytes(12).toString("hex"),
    slug: input.slug,
    guestLabel: input.guestLabel.trim().slice(0, 80),
    guestEmail: input.guestEmail.trim().toLowerCase().slice(0, 120),
    guestPhone: input.guestPhone.trim().slice(0, 40),
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    amount: Math.round(input.amount * 100) / 100,
    status: "pending",
    stayId: "",
    createdAt: new Date().toISOString(),
  };
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO pending_bookings (
        id, slug, guest_label, guest_email, guest_phone, check_in, check_out, guests, amount, status
      ) VALUES (
        ${next.id}, ${next.slug}, ${next.guestLabel}, ${next.guestEmail}, ${next.guestPhone},
        ${next.checkIn}, ${next.checkOut}, ${next.guests}, ${next.amount}, ${next.status}
      )
    `;
    return next;
  }
  const file = await readFile();
  file.push(next);
  await writeFile(file);
  return next;
}

export async function getPendingBooking(id: string): Promise<PendingBooking | null> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`SELECT * FROM pending_bookings WHERE id = ${id} LIMIT 1`;
    const row = rows[0] as Record<string, unknown> | undefined;
    return row ? rowToPending(row) : null;
  }
  return (await readFile()).find((item) => item.id === id) ?? null;
}

export async function fulfillPaidBooking(id: string): Promise<PendingBooking | { error: string }> {
  const pending = await getPendingBooking(id);
  if (!pending) return { error: "missing" };
  if (pending.status === "paid" && pending.stayId) return pending;

  const stay = await createManualStay({
    slug: pending.slug,
    guestLabel: pending.guestLabel,
    checkIn: pending.checkIn,
    checkOut: pending.checkOut,
    guests: pending.guests,
    bookedBy: "site",
  });
  if ("error" in stay) {
    if (pending.status === "paid") return pending;
    return { error: stay.error };
  }

  if (usePostgres()) {
    const sql = await pg();
    await sql`
      UPDATE pending_bookings
      SET status = 'paid', stay_id = ${stay.id}
      WHERE id = ${id}
    `;
  } else {
    const file = await readFile();
    const idx = file.findIndex((item) => item.id === id);
    if (idx >= 0) {
      file[idx] = { ...file[idx], status: "paid", stayId: stay.id };
      await writeFile(file);
    }
  }
  return { ...pending, status: "paid", stayId: stay.id };
}
