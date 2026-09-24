import { NextResponse } from "next/server";
import {
  OWNER_COOKIE,
  authenticateOwner,
  ownerAuthConfigured,
  ownerCookieOptions,
  createOwnerToken,
} from "@/lib/owner-auth";
import { clientIp, recordAuthAttempt, tooManyAuthAttempts } from "@/lib/owner-throttle";

export async function POST(req: Request) {
  if (!ownerAuthConfigured()) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }

  const ip = clientIp(req);
  if (await tooManyAuthAttempts(ip, "login")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  await recordAuthAttempt(ip, "login");
  const session = await authenticateOwner(String(body.email ?? ""), String(body.password ?? ""));
  if (!session) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(OWNER_COOKIE, createOwnerToken(session), ownerCookieOptions());
  return res;
}
