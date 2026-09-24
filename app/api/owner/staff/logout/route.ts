import { NextResponse } from "next/server";
import { STAFF_COOKIE } from "@/lib/owner-staff";
import { expiredSessionCookieOptions } from "@/lib/owner-cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_COOKIE, "", expiredSessionCookieOptions());
  return res;
}
