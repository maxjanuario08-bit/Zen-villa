import { NextResponse } from "next/server";
import { unlinkAccountFromLogement } from "@/lib/owner-accounts";
import { adminRequestOk } from "@/lib/owner-admin";

export async function POST(req: Request) {
  if (!(await adminRequestOk(req))) {
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
  if (!email || !slug) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const account = await unlinkAccountFromLogement(email, slug);
  if (!account) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, email: account.email, logements: account.logements });
}
