import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/owner-admin";
import { clearSessionCookie } from "@/lib/owner-cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  clearSessionCookie(res, ADMIN_COOKIE);
  return res;
}
