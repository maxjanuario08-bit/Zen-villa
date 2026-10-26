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
  await sql`ALTER TABLE owner_calendar ADD COLUMN IF NOT EXISTS ical_import_url TEXT NOT NULL DEFAULT ''`;
  await sql`
    CREATE TABLE IF NOT EXISTS pending_bookings (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      guest_label TEXT NOT NULL DEFAULT '',
      guest_email TEXT NOT NULL DEFAULT '',
      guest_phone TEXT NOT NULL DEFAULT '',
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INT NOT NULL DEFAULT 1,
      amount NUMERIC(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      stay_id TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS staff_accounts (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  await sql`ALTER TABLE owner_cleanings ADD COLUMN IF NOT EXISTS checklist_json TEXT NOT NULL DEFAULT '[]'`;
  await sql`
    CREATE TABLE IF NOT EXISTS staff_shifts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      clock_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      clock_out_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS auth_attempts (
      ip TEXT NOT NULL,
      kind TEXT NOT NULL,
      at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      zone TEXT NOT NULL DEFAULT '',
      property TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'field',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      active INT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_prospects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      zone TEXT NOT NULL DEFAULT '',
      property TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'other',
      status TEXT NOT NULL DEFAULT 'new',
      next_follow_up TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_prospect_log (
      id TEXT PRIMARY KEY,
      prospect_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS account_passwords (
      role TEXT NOT NULL, email TEXT NOT NULL, password_hash TEXT NOT NULL,
      changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (role, email)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY, role TEXT NOT NULL, email TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS password_reset_expiry ON password_reset_tokens (expires_at)`;
  await sql`ALTER TABLE pending_bookings ADD COLUMN IF NOT EXISTS paypal_txn_id TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE pending_bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS booking_paypal_transaction ON pending_bookings(paypal_txn_id) WHERE paypal_txn_id<>''`;
  await sql`CREATE TABLE IF NOT EXISTS booking_mail_deliveries (id TEXT PRIMARY KEY, sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS profile_json TEXT NOT NULL DEFAULT '{}'`;
  await sql`ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS client_id TEXT NOT NULL DEFAULT ''`;
  await sql`CREATE TABLE IF NOT EXISTS crm_contact_records (id TEXT PRIMARY KEY, data_json TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS crm_property_records (id TEXT PRIMARY KEY, data_json TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS crm_oppositions (fingerprint TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS crm_tasks (id TEXT PRIMARY KEY, prospect_id TEXT NOT NULL, title TEXT NOT NULL, due TEXT NOT NULL DEFAULT '', done BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE INDEX IF NOT EXISTS crm_tasks_prospect ON crm_tasks (prospect_id)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS crm_source_identity ON crm_prospects ((profile_json::jsonb->>'sourceId')) WHERE (profile_json::jsonb->>'sourceId') IS NOT NULL AND (profile_json::jsonb->>'sourceId') <> ''`;
  ready = true;
}

export async function pg() {
  await ensureOwnerSchema();
  return client();
}
