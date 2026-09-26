import type { NextResponse } from "next/server";
import { isProductionRuntime } from "@/lib/owner-config";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isProd() {
  return isProductionRuntime() || process.env.VERCEL === "1";
}

export function sessionCookieOptions() {
  const prod = isProd();
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: prod,
    path: "/",
    maxAge: WEEK_MS / 1000,
    ...(prod ? { domain: ".zen-villa.fr" as const } : {}),
  };
}

export function expiredSessionCookieOptions() {
  return { ...sessionCookieOptions(), maxAge: 0, expires: new Date(0) };
}

function expiredCookieHeader(name: string, domain?: string) {
  const parts = [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isProd()) parts.push("Secure");
  if (domain) parts.push(`Domain=${domain}`);
  return parts.join("; ");
}

/** Expire le cookie host-only et les variantes Domain= (www / apex), sinon la déconnexion échoue. */
export function clearSessionCookie(res: NextResponse, name: string) {
  res.headers.append("Set-Cookie", expiredCookieHeader(name));
  if (isProd()) {
    res.headers.append("Set-Cookie", expiredCookieHeader(name, ".zen-villa.fr"));
    res.headers.append("Set-Cookie", expiredCookieHeader(name, "www.zen-villa.fr"));
    res.headers.append("Set-Cookie", expiredCookieHeader(name, "zen-villa.fr"));
  }
}
