import { createHmac, createHash, timingSafeEqual } from "crypto";
import { passwordOverride, sessionPasswordValid } from "@/lib/password-credentials";
import { verifyPassword } from "@/lib/owner-accounts";
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

function adminPasswordStamp() {
  const password = ownerAdminPassword();
  if (password.length < 8) return "";
  return createHash("sha256").update(password).digest("base64url").slice(0, 16);
}

export function createAdminToken(email: string): string {
  const secret = ownerSessionSecret();
  const body = {
    email: email.toLowerCase(),
    role: "admin",
    iat: Date.now(),
    stamp: adminPasswordStamp(),
    exp: Date.now() + WEEK_MS,
  };
  const json = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${json}.${sign(json, secret)}`;
}

export function readAdminToken(token: string): AdminSession | null {
  const secret = ownerSessionSecret();
  if (!secret || !adminAuthConfigured()) return null;
  const [json, sig] = token.split(".");
  if (!json || !sig) return null;
  if (!safeEqual(sig, sign(json, secret))) return null;
  try {
    const payload = JSON.parse(Buffer.from(json, "base64url").toString()) as {
      email?: string;
      role?: string;
      stamp?: string;
      exp?: number;
    };
    if (payload.role !== "admin" || !payload.email || !payload.exp || payload.exp < Date.now()) {
      return null;
    }
    const stamp = adminPasswordStamp();
    if (!stamp || payload.stamp !== stamp) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw) return null;
  const session = readAdminToken(raw);
  if (!session || !(await sessionPasswordValid("admin", session.email, raw))) return null;
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    const locale = await getLocale();
    redirect(localeAdminPath(locale));
  }
  return session;
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminSession | null> {
  const givenEmail = email.trim().toLowerCase();
  const givenPassword = password;
  if (!givenEmail || !givenPassword) return null;
  if (givenEmail !== ownerAdminEmail() || givenPassword.length < 8) return null;
  const override = await passwordOverride("admin", givenEmail);
  if (override) return await verifyPassword(givenPassword, override.password_hash) ? { email: givenEmail } : null;
  const expected = ownerAdminPassword();
  if (expected.length < 8 || !safeEqual(givenPassword, expected)) return null;
  return { email: givenEmail };
}

export async function adminBearerOk(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;
  if (await authenticateAdmin(ownerAdminEmail(), token)) return true;
  const candidates = [ownerAdminSecret()].filter((s) => s.length >= 8);
  return candidates.some((expected) => safeEqual(token, expected));
}

export async function adminRequestOk(req: Request) {
  if (await adminBearerOk(req)) return true;
  return Boolean(await getAdminSession());
}
