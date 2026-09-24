import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { sessionCookieOptions } from "@/lib/owner-cookies";
import { ownerSessionSecret, ownerStoreReady } from "@/lib/owner-config";

export const STAFF_COOKIE = "zv_staff";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type StaffSession = { email: string; role: "staff" };

const STAFF_CODE_DEFAULT = "08081993";

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

export function staffPassword() {
  const fromEnv = process.env.STAFF_PASSWORD?.trim() ?? "";
  if (fromEnv.length >= 8) return fromEnv;
  return STAFF_CODE_DEFAULT;
}

export function staffAuthConfigured() {
  return Boolean(ownerSessionSecret()) && ownerStoreReady() && staffPassword().length >= 8;
}

export function localeStaffPath(locale: string) {
  return locale === "fr" ? "/equipe" : `/${locale}/equipe`;
}

export function staffCookieOptions() {
  return sessionCookieOptions();
}

export function createStaffToken(email: string): string {
  const secret = ownerSessionSecret();
  const body = { email: email.toLowerCase(), role: "staff", exp: Date.now() + WEEK_MS };
  const json = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${json}.${sign(json, secret)}`;
}

export function readStaffToken(token: string): StaffSession | null {
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
    if (payload.role !== "staff" || !payload.email || !payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return { email: payload.email, role: "staff" };
  } catch {
    return null;
  }
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const jar = await cookies();
  const raw = jar.get(STAFF_COOKIE)?.value;
  if (!raw) return null;
  return readStaffToken(raw);
}

export async function requireStaff() {
  const session = await getStaffSession();
  if (!session) {
    const locale = await getLocale();
    redirect(localeStaffPath(locale));
  }
  return session;
}

export function authenticateStaff(code: string): StaffSession | null {
  const expected = staffPassword();
  const given = code.trim();
  if (!expected || given.length < 8) return null;
  if (!safeEqual(given, expected)) return null;
  return { email: "staff", role: "staff" };
}
