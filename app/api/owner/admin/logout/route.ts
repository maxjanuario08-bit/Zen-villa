import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/owner-admin";
import { expiredSessionCookieOptions } from "@/lib/owner-cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", expiredSessionCookieOptions());
  return res;
}
