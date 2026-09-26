import { NextResponse } from "next/server";
import { getBookingWithAvailability } from "@/lib/owner-calendar";
import { getLogement } from "@/lib/logements";
import { quoteStay, rangeIsAvailable } from "@/lib/booking";
import { paypalPayUrl, publicSiteOrigin } from "@/lib/paypal";
import { createPendingBooking } from "@/lib/pending-bookings";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: {
    slug?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    nom?: string;
    email?: string;
    telephone?: string;
    returnUrl?: string;
    cancelUrl?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  const logement = getLogement(slug);
  const booking = await getBookingWithAvailability(slug);
  if (!logement?.booking || !booking) {
    return NextResponse.json({ error: "unknown" }, { status: 404 });
  }
  if (logement.booking.paypalEnabled !== true) {
    return NextResponse.json({ error: "paypal_disabled" }, { status: 503 });
  }

  const checkIn = String(body.checkIn ?? "");
  const checkOut = String(body.checkOut ?? "");
  const guests = Number(body.guests) || 0;
  const nom = String(body.nom ?? "").trim();
  const email = String(body.email ?? "").trim();
  const telephone = String(body.telephone ?? "").trim();
  if (!nom || !email.includes("@") || !telephone || guests < 1 || guests > logement.guests) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!rangeIsAvailable(checkIn, checkOut, booking)) {
    return NextResponse.json({ error: "unavailable" }, { status: 409 });
  }

  const quote = quoteStay(checkIn, checkOut, booking);
  const pending = await createPendingBooking({
    slug,
    guestLabel: nom,
    guestEmail: email,
    guestPhone: telephone,
    checkIn,
    checkOut,
    guests,
    amount: quote.total,
  });

  const origin = publicSiteOrigin(req);
  const returnUrl = String(body.returnUrl ?? "").startsWith("http")
    ? String(body.returnUrl)
    : `${origin}/logements/${slug}?paid=1&booking=${pending.id}`;
  const cancelUrl = String(body.cancelUrl ?? "").startsWith("http")
    ? String(body.cancelUrl)
    : `${origin}/logements/${slug}?canceled=1`;
  const itemName = `${nom} · ${checkIn} → ${checkOut}`;
  const payUrl = paypalPayUrl(quote.total, itemName, {
    custom: pending.id,
    invoice: pending.id,
    notifyUrl: `${origin}/api/paypal/ipn`,
    returnUrl,
    cancelUrl,
  });

  return NextResponse.json({ ok: true, payUrl, bookingId: pending.id });
}
