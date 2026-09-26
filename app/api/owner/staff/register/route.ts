import { NextResponse } from "next/server";
import {
  STAFF_COOKIE,
  createStaffToken,
  staffCookieOptions,
  staffSignupCode,
  staffSignupConfigured,
} from "@/lib/owner-staff";
import { createStaffAccount } from "@/lib/staff-accounts";
import { clientIp, recordAuthAttempt, tooManyAuthAttempts } from "@/lib/owner-throttle";
import { timingSafeEqual } from "crypto";

function codeOk(given: string) {
  const expected = staffSignupCode();
  if (expected.length < 8 || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function POST(req: Request) {
  if (!staffSignupConfigured()) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }

  const ip = clientIp(req);
  if (await tooManyAuthAttempts(ip, "staff_register")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { email?: string; name?: string; password?: string; teamCode?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!codeOk(String(body.teamCode ?? "").trim())) {
    await recordAuthAttempt(ip, "staff_register");
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  const created = await createStaffAccount({
    email: String(body.email ?? ""),
    name: String(body.name ?? ""),
    password: String(body.password ?? ""),
  });
  if ("error" in created) {
    const status = created.error === "exists" ? 409 : 400;
    return NextResponse.json({ error: created.error }, { status });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_COOKIE, createStaffToken(created.email, created.name), staffCookieOptions());
  return res;
}
