import { receiveInquiry } from "@/lib/admin-inbox";
import { NextResponse } from "next/server";
import { notifyContactMessage } from "@/lib/site-mail";

const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 15 * 60 * 1000);
  if (recent.length >= 8) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "limited" }, { status: 429 });

  let body: {
    nom?: string;
    email?: string;
    telephone?: string;
    ville?: string;
    type?: string;
    message?: string;
    source?: string;
    form?: string;
    propertyAddress?: string;
    contactConsent?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });

  const nom = String(body.nom ?? "").trim().slice(0, 80);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 120);
  const telephone = String(body.telephone ?? "").trim().slice(0, 40);
  const ownerForm = body.form === "owner";
  const propertyAddress = typeof body.propertyAddress === "string" ? body.propertyAddress.trim().slice(0, 250) : "";
  const message = String(body.message ?? "").trim().slice(0, 4000);
  const validDetails = ownerForm
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && propertyAddress && body.contactConsent === true
    : email.includes("@") && telephone && message.length >= 2;
  if (!nom || !validDetails) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    await receiveInquiry("contact", {
      nom,
      email,
      telephone,
      ville: String(body.ville ?? "").trim().slice(0, 80),
      type: String(body.type ?? "").trim().slice(0, 80),
      message: ownerForm ? "Demande de contact propriétaire." : message,
      ...(ownerForm ? { propertyAddress, contactConsent: true } : {}),
    }, body.source, notifyContactMessage);
  } catch {
    return NextResponse.json({ error: "inbox_unavailable" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
