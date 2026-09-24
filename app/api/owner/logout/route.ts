import { NextResponse } from "next/server";
import { OWNER_COOKIE } from "@/lib/owner-auth";
import { expiredSessionCookieOptions } from "@/lib/owner-cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OWNER_COOKIE, "", expiredSessionCookieOptions());
  return res;
}
