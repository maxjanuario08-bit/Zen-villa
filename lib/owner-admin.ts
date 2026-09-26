import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { sessionCookieOptions } from "@/lib/owner-cookies";
import {
  ownerAdminEmail,
  ownerAdminPassword,
  ownerAdminSecret,
  ownerSessionSecret,
  ownerStoreReady,
} from "@/lib/owner-config";

export const ADMIN_COOKIE = "zv_admin";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type AdminSession = { email: string };

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
  return sessionCookieOptions();
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
  const givenEmail = email.trim().toLowerCase();
  const givenPassword = password.trim();
  if (givenEmail !== ownerAdminEmail() || givenPassword.length < 8) return null;
  const expected = ownerAdminPassword();
  if (expected.length < 8 || !safeEqual(givenPassword, expected)) return null;
  return { email: givenEmail };
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
