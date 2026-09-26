import { NextResponse } from "next/server";
import { STAFF_COOKIE } from "@/lib/owner-staff";
import { clearSessionCookie } from "@/lib/owner-cookies";

function equipeUrl(req: Request) {
  const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host") || "www.zen-villa.fr";
  const host = hostHeader.split(":")[0];
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const hostname = host === "zen-villa.fr" ? "www.zen-villa.fr" : host;
  const port = hostHeader.includes(":") && (hostname === "localhost" || hostname === "127.0.0.1")
    ? `:${hostHeader.split(":")[1]}`
    : "";
  return `${proto}://${hostname}${port}/equipe`;
}

export async function POST(req: Request) {
  const res = NextResponse.redirect(equipeUrl(req), 303);
  res.headers.set("Cache-Control", "no-store");
  clearSessionCookie(res, STAFF_COOKIE);
  return res;
}
