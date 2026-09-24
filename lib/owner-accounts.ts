import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import { usePostgres, pg } from "@/lib/owner-pg";
import type { OwnerAccount } from "@/lib/owner-types";

export type { OwnerAccount };

const scrypt = promisify(scryptCb);
const STORE_PATH = path.join(process.cwd(), "data", "owner-accounts.json");

type AccountsFile = { accounts: OwnerAccount[] };

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

function parseLogements(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function readFile(): Promise<AccountsFile> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as AccountsFile;
    if (!parsed || !Array.isArray(parsed.accounts)) return { accounts: [] };
    return parsed;
  } catch {
    return { accounts: [] };
  }
}

async function writeFile(data: AccountsFile) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const buf = (await scrypt(password, salt, 64)) as Buffer;
  return safeEqualHex(buf.toString("hex"), hash);
}

function rowToAccount(row: {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  logements_json: string;
  property_note: string;
  created_at: string | Date;
}): OwnerAccount {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    logements: parseLogements(row.logements_json),
    propertyNote: row.property_note ?? "",
    createdAt: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
  };
}

export async function findAccountByEmail(email: string): Promise<OwnerAccount | null> {
  const key = email.trim().toLowerCase();
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`
      SELECT id, email, name, password_hash, logements_json, property_note, created_at
      FROM owners WHERE email = ${key} LIMIT 1
    `;
    const row = rows[0] as
      | {
          id: string;
          email: string;
          name: string;
          password_hash: string;
          logements_json: string;
          property_note: string;
          created_at: string | Date;
        }
      | undefined;
    return row ? rowToAccount(row) : null;
  }
  const file = await readFile();
  return file.accounts.find((a) => a.email === key) ?? null;
}

export async function createOwnerAccount(input: {
  email: string;
  name: string;
  password: string;
  propertyNote?: string;
}): Promise<OwnerAccount | { error: "exists" | "weak" }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;
  if (password.length < 8) return { error: "weak" };
  const existing = await findAccountByEmail(email);
  if (existing) return { error: "exists" };

  const account: OwnerAccount = {
    id: randomBytes(8).toString("hex"),
    name,
    email,
    passwordHash: await hashPassword(password),
    logements: [],
    propertyNote: (input.propertyNote ?? "").trim().slice(0, 200),
    createdAt: new Date().toISOString(),
  };

  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO owners (id, email, name, password_hash, logements_json, property_note, created_at)
      VALUES (
        ${account.id},
        ${account.email},
        ${account.name},
        ${account.passwordHash},
        ${JSON.stringify(account.logements)},
        ${account.propertyNote},
        ${account.createdAt}
      )
    `;
    return account;
  }

  const file = await readFile();
  file.accounts.push(account);
  await writeFile(file);
  return account;
}

export type OwnerPublicAccount = {
  email: string;
  name: string;
  logements: string[];
  propertyNote: string;
  createdAt: string;
};

function toPublic(account: OwnerAccount): OwnerPublicAccount {
  return {
    email: account.email,
    name: account.name,
    logements: account.logements,
    propertyNote: account.propertyNote,
    createdAt: account.createdAt,
  };
}

export async function listOwnerAccounts(): Promise<OwnerPublicAccount[]> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`
      SELECT id, email, name, password_hash, logements_json, property_note, created_at
      FROM owners
      ORDER BY created_at DESC
    `;
    return (rows as Array<Parameters<typeof rowToAccount>[0]>).map((row) => toPublic(rowToAccount(row)));
  }
  const file = await readFile();
  return [...file.accounts]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toPublic);
}

async function saveLogements(account: OwnerAccount) {
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      UPDATE owners SET logements_json = ${JSON.stringify(account.logements)} WHERE email = ${account.email}
    `;
    return;
  }
  const file = await readFile();
  const idx = file.accounts.findIndex((a) => a.email === account.email);
  if (idx >= 0) file.accounts[idx] = account;
  await writeFile(file);
}

export async function linkAccountToLogement(email: string, slug: string): Promise<OwnerAccount | null> {
  const account = await findAccountByEmail(email);
  if (!account) return null;
  if (!account.logements.includes(slug)) {
    account.logements = [...account.logements, slug];
  }
  await saveLogements(account);
  return account;
}

export async function unlinkAccountFromLogement(email: string, slug: string): Promise<OwnerAccount | null> {
  const account = await findAccountByEmail(email);
  if (!account) return null;
  account.logements = account.logements.filter((item) => item !== slug);
  await saveLogements(account);
  return account;
}
