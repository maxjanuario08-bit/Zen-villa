import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import {
  isProductionRuntime,
  ownerAdminEmail,
  ownerAdminPassword,
  ownerAdminSecret,
  ownerSessionSecret,
  ownerStoreReady,
} from "@/lib/owner-config";

export const ADMIN_COOKIE = "zv_admin";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type AdminSession = { email: string };

function isProd() {
  return isProductionRuntime() || process.env.VERCEL === "1";
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function adminAuthConfigured() {
  return Boolean(ownerSessionSecret()) && ownerStoreReady() && ownerAdminPassword().length >= 8;
}

export function localeAdminPath(locale: string) {
  return locale === "fr" ? "/admin" : `/${locale}/admin`;
}

export function adminCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd(),
    path: "/",
    maxAge: WEEK_MS / 1000,
  };
}

export function createAdminToken(email: string): string {
  const secret = ownerSessionSecret();
  const body = { email: email.toLowerCase(), role: "admin", exp: Date.now() + WEEK_MS };
  const json = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${json}.${sign(json, secret)}`;
}

export function readAdminToken(token: string): AdminSession | null {
  const secret = ownerSessionSecret();
  if (!secret) return null;
  const [json, sig] = token.split(".");
  if (!json || !sig) return null;
  if (!safeEqual(sig, sign(json, secret))) return null;
  try {
    const payload = JSON.parse(Buffer.from(json, "base64url").toString()) as {
      email?: string;
      role?: string;
      exp?: number;
    };
    if (payload.role !== "admin" || !payload.email || !payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw) return null;
  return readAdminToken(raw);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    const locale = await getLocale();
    redirect(localeAdminPath(locale));
  }
  return session;
}

export function authenticateAdmin(email: string, password: string): AdminSession | null {
  const expectedEmail = ownerAdminEmail();
  const expectedPassword = ownerAdminPassword();
  const givenEmail = email.trim().toLowerCase();
  const givenPassword = password.trim();
  if (!expectedPassword || givenPassword.length < 8) return null;
  if (givenEmail !== expectedEmail) return null;
  if (!safeEqual(givenPassword, expectedPassword)) return null;
  return { email: expectedEmail };
}

export function adminBearerOk(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const candidates = [ownerAdminPassword(), ownerAdminSecret()].filter((s) => s.length >= 8);
  return candidates.some((expected) => safeEqual(token, expected));
}

export async function adminRequestOk(req: Request) {
  if (adminBearerOk(req)) return true;
  return Boolean(await getAdminSession());
}
