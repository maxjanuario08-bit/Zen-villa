import { createHmac, timingSafeEqual } from "crypto";
import { ownerSessionSecret } from "@/lib/owner-config";

const HOUR_MS = 60 * 60 * 1000;

function sign(value: string) {
  return createHmac("sha256", ownerSessionSecret()).update(value).digest("base64url");
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

export function signedCleaningPhotoUrl(cleaningId: string, index: number) {
  const exp = Date.now() + HOUR_MS;
  const payload = `${cleaningId}:${index}:${exp}`;
  const sig = sign(payload);
  return `/api/owner/media?c=${encodeURIComponent(cleaningId)}&i=${index}&e=${exp}&s=${sig}`;
}

export function readCleaningPhotoToken(c: string, i: string, e: string, s: string) {
  const index = Number(i);
  const exp = Number(e);
  if (!c || !Number.isInteger(index) || index < 0 || !exp || exp < Date.now()) return null;
  const payload = `${c}:${index}:${exp}`;
  if (!safeEqual(sign(payload), s)) return null;
  return { cleaningId: c, index };
}
