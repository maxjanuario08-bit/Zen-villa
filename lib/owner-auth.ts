import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { findAccountByEmail, verifyPassword } from "@/lib/owner-accounts";
import { isProductionRuntime, ownerDemoEnabled, ownerSessionSecret, ownerStoreReady } from "@/lib/owner-config";
import { DEMO_OWNER } from "@/lib/owner-seed";
import type { OwnerSession } from "@/lib/owner-types";

export const OWNER_COOKIE = "zv_owner";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isProd() {
  return isProductionRuntime() || process.env.VERCEL === "1";
}

function sessionSecret() {
  return ownerSessionSecret();
}

export function demoOwnerCredentials() {
  if (!ownerDemoEnabled()) return { email: "", password: "" };
  const email =
    process.env.OWNER_DEMO_EMAIL?.trim() || (!isProductionRuntime() ? "proprio@localhost" : "");
  const password =
    process.env.OWNER_DEMO_PASSWORD?.trim() || (!isProductionRuntime() ? "zenvilla-demo" : "");
  return { email, password };
}

export function ownerAuthConfigured() {
  return Boolean(sessionSecret()) && ownerStoreReady();
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

export function isDemoOwnerEmail(email: string) {
  const expected = demoOwnerCredentials().email.trim().toLowerCase();
  return Boolean(expected) && email.trim().toLowerCase() === expected;
}

export async function authenticateOwner(email: string, password: string): Promise<OwnerSession | null> {
  const key = email.trim().toLowerCase();
  if (!key || !password) return null;

  const demo = demoOwnerCredentials();
  if (demo.email && demo.password && isDemoOwnerEmail(key) && safeEqual(password, demo.password)) {
    return {
      email: demo.email.toLowerCase(),
      name: DEMO_OWNER.name,
      logements: [...DEMO_OWNER.logements],
    };
  }

  const account = await findAccountByEmail(key);
  if (!account) return null;
  const ok = await verifyPassword(password, account.passwordHash);
  if (!ok) return null;
  return {
    email: account.email,
    name: account.name,
    logements: account.logements,
  };
}

export function createOwnerToken(session: OwnerSession): string {
  const secret = sessionSecret();
  const body = {
    email: session.email.toLowerCase(),
    name: session.name,
    logements: [...session.logements],
    exp: Date.now() + WEEK_MS,
  };
  const json = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${json}.${sign(json, secret)}`;
}

export function readOwnerToken(token: string): OwnerSession | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const [json, sig] = token.split(".");
  if (!json || !sig) return null;
  const expected = sign(json, secret);
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(json, "base64url").toString()) as OwnerSession & {
      exp?: number;
    };
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (!payload.email) return null;
    return {
      email: payload.email,
      name: payload.name,
      logements: Array.isArray(payload.logements) ? payload.logements : [],
    };
  } catch {
    return null;
  }
}

export function ownerCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd(),
    path: "/",
    maxAge: WEEK_MS / 1000,
  };
}

export async function getOwnerSession(): Promise<OwnerSession | null> {
  const jar = await cookies();
  const raw = jar.get(OWNER_COOKIE)?.value;
  if (!raw) return null;
  const token = readOwnerToken(raw);
  if (!token) return null;
  const account = await findAccountByEmail(token.email);
  if (account) {
    return { email: account.email, name: account.name, logements: account.logements };
  }
  if (ownerDemoEnabled() && isDemoOwnerEmail(token.email)) {
    return {
      email: token.email,
      name: DEMO_OWNER.name,
      logements: [...DEMO_OWNER.logements],
    };
  }
  return token;
}

export function localeLoginPath(locale: string) {
  return locale === "fr" ? "/connexion" : `/${locale}/connexion`;
}

export function localeSignupPath(locale: string) {
  return locale === "fr" ? "/inscription" : `/${locale}/inscription`;
}

export function localeComptePath(locale: string, slug?: string) {
  const base = locale === "fr" ? "/compte" : `/${locale}/compte`;
  return slug ? `${base}/${slug}` : base;
}

export async function requireOwner() {
  const session = await getOwnerSession();
  if (!session) {
    const locale = await getLocale();
    redirect(localeLoginPath(locale));
  }
  return session;
}

export function ownerOwnsSlug(session: OwnerSession, slug: string) {
  return session.logements.includes(slug);
}
