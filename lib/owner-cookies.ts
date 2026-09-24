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
  return { ...sessionCookieOptions(), maxAge: 0 };
}
