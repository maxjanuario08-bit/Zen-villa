import { neon } from "@neondatabase/serverless";
import { databaseUrl } from "@/lib/owner-config";

let ready = false;

export function usePostgres() {
  return Boolean(databaseUrl());
}

function client() {
  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL manquant");
  return neon(url);
}

export async function ensureOwnerSchema() {
  if (ready) return;
  const sql = client();
  await sql`
    CREATE TABLE IF NOT EXISTS owners (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      logements_json TEXT NOT NULL DEFAULT '[]',
      property_note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS owner_calendar (
      slug TEXT PRIMARY KEY,
      blocks_json TEXT NOT NULL DEFAULT '[]'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS owner_stays (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      guest_key TEXT NOT NULL DEFAULT '',
      guest_label TEXT NOT NULL DEFAULT '',
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INT NOT NULL DEFAULT 1,
      checked_in_at TIMESTAMPTZ,
      checked_out_at TIMESTAMPTZ
    )
  `;
  await sql`ALTER TABLE owner_stays ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ`;
  await sql`ALTER TABLE owner_stays ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ`;
  await sql`ALTER TABLE owner_stays ADD COLUMN IF NOT EXISTS checkin_photos_json TEXT NOT NULL DEFAULT '[]'`;
  await sql`ALTER TABLE owner_stays ADD COLUMN IF NOT EXISTS checkout_photos_json TEXT NOT NULL DEFAULT '[]'`;
  await sql`ALTER TABLE owner_stays ADD COLUMN IF NOT EXISTS checked_in_by TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE owner_stays ADD COLUMN IF NOT EXISTS checked_out_by TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE owner_stays ADD COLUMN IF NOT EXISTS check_in_time TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE owner_stays ADD COLUMN IF NOT EXISTS check_out_time TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE owner_stays ADD COLUMN IF NOT EXISTS booked_by TEXT NOT NULL DEFAULT ''`;
  await sql`
    CREATE TABLE IF NOT EXISTS owner_cleanings (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      stay_id TEXT NOT NULL DEFAULT '',
      date DATE NOT NULL,
      time TEXT NOT NULL,
      cleaner_id TEXT NOT NULL DEFAULT 'marie',
      notes TEXT NOT NULL DEFAULT '',
      photos_json TEXT NOT NULL DEFAULT '[]'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS auth_attempts (
      ip TEXT NOT NULL,
      kind TEXT NOT NULL,
      at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function pg() {
  await ensureOwnerSchema();
  return client();
}
