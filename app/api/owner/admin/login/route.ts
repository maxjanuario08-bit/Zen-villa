import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminAuthConfigured,
  adminCookieOptions,
  authenticateAdmin,
  createAdminToken,
} from "@/lib/owner-admin";
import { clientIp, recordAuthAttempt, tooManyAuthAttempts } from "@/lib/owner-throttle";

export async function POST(req: Request) {
  if (!adminAuthConfigured()) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }

  const ip = clientIp(req);
  if (await tooManyAuthAttempts(ip, "admin_v2")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const session = authenticateAdmin(String(body.email ?? ""), String(body.password ?? ""));
  if (!session) {
    await recordAuthAttempt(ip, "admin_v2");
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createAdminToken(session.email), adminCookieOptions());
  return res;
}
