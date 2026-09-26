import { NextResponse } from "next/server";
import {
  STAFF_COOKIE,
  createStaffToken,
  staffAuthConfigured,
  staffCookieOptions,
} from "@/lib/owner-staff";
import { authenticateStaffAccount } from "@/lib/staff-accounts";
import { clientIp, recordAuthAttempt, tooManyAuthAttempts } from "@/lib/owner-throttle";

export async function POST(req: Request) {
  if (!staffAuthConfigured()) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }

  const ip = clientIp(req);
  if (await tooManyAuthAttempts(ip, "staff_v1")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { email?: string; password?: string; code?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const account = await authenticateStaffAccount(String(body.email ?? ""), String(body.password ?? body.code ?? ""));
  if (!account) {
    await recordAuthAttempt(ip, "staff_v1");
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_COOKIE, createStaffToken(account.email, account.name), staffCookieOptions());
  return res;
}
