import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { hashPassword, verifyPassword } from "@/lib/owner-accounts";
import { pg, usePostgres } from "@/lib/owner-pg";
import type { StaffAccount } from "@/lib/owner-types";

const STORE_PATH = path.join(process.cwd(), "data", "staff-accounts.json");

async function readFile(): Promise<StaffAccount[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as { accounts?: StaffAccount[] };
    return parsed.accounts ?? [];
  } catch {
    return [];
  }
}

async function writeFile(accounts: StaffAccount[]) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, `${JSON.stringify({ accounts }, null, 2)}\n`, "utf8");
}

function rowToStaff(row: Record<string, unknown>): StaffAccount {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    passwordHash: String(row.password_hash || row.passwordHash || ""),
    createdAt: String(row.created_at || row.createdAt || ""),
  };
}

export async function getStaffAccountByEmail(email: string): Promise<StaffAccount | null> {
  const key = email.trim().toLowerCase();
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`SELECT * FROM staff_accounts WHERE email = ${key} LIMIT 1`;
    const row = rows[0] as Record<string, unknown> | undefined;
    return row ? rowToStaff(row) : null;
  }
  return (await readFile()).find((item) => item.email === key) ?? null;
}

export async function createStaffAccount(input: {
  email: string;
  name: string;
  password: string;
}): Promise<StaffAccount | { error: "exists" | "weak" | "invalid" }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim().slice(0, 80);
  if (!email.includes("@") || name.length < 2) return { error: "invalid" };
  if (input.password.length < 8) return { error: "weak" };
  if (await getStaffAccountByEmail(email)) return { error: "exists" };
  const account: StaffAccount = {
    id: randomBytes(8).toString("hex"),
    email,
    name,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO staff_accounts (id, email, name, password_hash)
      VALUES (${account.id}, ${account.email}, ${account.name}, ${account.passwordHash})
    `;
    return account;
  }
  const file = await readFile();
  file.push(account);
  await writeFile(file);
  return account;
}

export async function authenticateStaffAccount(email: string, password: string): Promise<StaffAccount | null> {
  const account = await getStaffAccountByEmail(email);
  if (!account) return null;
  if (!(await verifyPassword(password, account.passwordHash))) return null;
  return account;
}
