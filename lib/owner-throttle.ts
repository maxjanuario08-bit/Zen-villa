import { pg, usePostgres } from "@/lib/owner-pg";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 25;
const memory = new Map<string, number[]>();

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

type AuthKind = "login" | "register" | "admin";

export async function tooManyAuthAttempts(ip: string, kind: AuthKind) {
  const key = `${kind}:${ip}`;
  const now = Date.now();
  if (usePostgres()) {
    const sql = await pg();
    const since = new Date(now - WINDOW_MS).toISOString();
    const rows = await sql`
      SELECT COUNT(*)::int AS n FROM auth_attempts
      WHERE ip = ${ip} AND kind = ${kind} AND at > ${since}
    `;
    const n = Number((rows[0] as { n?: number } | undefined)?.n ?? 0);
    return n >= MAX_ATTEMPTS;
  }
  const hits = (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  memory.set(key, hits);
  return hits.length >= MAX_ATTEMPTS;
}

export async function recordAuthAttempt(ip: string, kind: AuthKind) {
  const key = `${kind}:${ip}`;
  const now = Date.now();
  if (usePostgres()) {
    const sql = await pg();
    await sql`INSERT INTO auth_attempts (ip, kind, at) VALUES (${ip}, ${kind}, NOW())`;
    return;
  }
  const hits = (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  memory.set(key, hits);
}
