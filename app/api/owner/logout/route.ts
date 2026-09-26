import { NextResponse } from "next/server";
import { OWNER_COOKIE } from "@/lib/owner-auth";
import { clearSessionCookie } from "@/lib/owner-cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  clearSessionCookie(res, OWNER_COOKIE);
  return res;
}
