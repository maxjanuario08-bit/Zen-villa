import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getLogement } from "@/lib/logements";
import { linkAccountToLogement } from "@/lib/owner-accounts";
import { ownerAdminSecret } from "@/lib/owner-config";

function adminOk(req: Request) {
  const expected = ownerAdminSecret();
  if (!expected || expected.length < 16) return false;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!adminOk(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { email?: string; slug?: string };
  try {
    body = (await req.json()) as { email?: string; slug?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const slug = String(body.slug ?? "").trim();
  if (!email || !getLogement(slug)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const account = await linkAccountToLogement(email, slug);
  if (!account) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, email: account.email, logements: account.logements });
}
