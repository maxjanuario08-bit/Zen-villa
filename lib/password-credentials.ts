import { pg } from "@/lib/owner-pg";
import { databaseUrl } from "@/lib/owner-config";

export type AccountRole = "admin" | "owner" | "staff";
export function accountRole(value: unknown): AccountRole | null {
  return value === "admin" || value === "owner" || value === "staff" ? value : null;
}

export async function passwordOverride(role: AccountRole, email: string) {
  if (!databaseUrl()) return null;
  const sql = await pg();
  const rows = await sql`SELECT password_hash, changed_at FROM account_passwords WHERE role = ${role} AND email = ${email}`;
  return rows[0] as { password_hash: string; changed_at: string | Date } | undefined ?? null;
}

/** The signed token must have been issued after the latest password reset. */
export async function sessionPasswordValid(role: AccountRole, email: string, signedToken: string) {
  const credential = await passwordOverride(role, email);
  if (!credential) return true;
  try {
    const payload = JSON.parse(Buffer.from(signedToken.split(".")[0], "base64url").toString());
    return typeof payload.iat === "number" && payload.iat >= new Date(credential.changed_at).getTime();
  } catch {
    return false;
  }
}
