import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CONTACT } from "@/lib/constants";
import { sendMail } from "@/lib/mail";
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
    pricingEmailConsent?: boolean;
    pricingPhoneConsent?: boolean;
    website?: string;
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
  if (body.form === "owner-pricing") {
    const phone = body.pricingPhoneConsent === true;
    if (body.website || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        (phone && !/^\+?[\d .()-]{7,30}$/.test(telephone)) ||
        (phone && telephone.replace(/\D/g, "").length < 7)) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    try {
      const filename = "zenvilla-tarifs-proprietaires.pdf";
      const pdf = await readFile(join(process.cwd(), "output", "pdf", "zenvilla-tarifs-proprietaires.pdf"));
      const accepted = await receiveInquiry("contact", {
        nom: email,
        email,
        telephone: phone ? telephone : "",
        message: "Grille tarifaire propriétaires demandée.",
        prestation: "Grille tarifaire",
        pricingConsent: {
          email: body.pricingEmailConsent === true,
          phone,
          recordedAt: new Date().toISOString(),
        },
      }, "grille-tarifaire", async () => (await sendMail({
        to: email,
        subject: "Votre grille tarifaire propriétaires | Zen Villa",
        text: "Bonjour,\n\nVous trouverez en pièce jointe la grille des tarifs à la carte de Zen Villa.\n\nL’équipe Zen Villa",
        replyTo: CONTACT.email,
        attachments: [{ filename, content: pdf.toString("base64") }],
      })) === true);
      return accepted ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "delivery_failed" }, { status: 503 });
    } catch {
      return NextResponse.json({ error: "pricing_unavailable" }, { status: 503 });
    }
  }
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
