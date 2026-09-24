import { NextResponse } from "next/server";
import { quoteStay, rangeIsAvailable } from "@/lib/booking";
import { getLogement } from "@/lib/logements";
import { getBookingWithAvailability } from "@/lib/owner-calendar";
import { getStripe } from "@/lib/stripe";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function originFromRequest(req: Request) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  if (!host) return null;
  return `${proto}://${host}`;
}

function listingPath(locale: string, slug: string) {
  const prefix = locale === "fr" ? "" : `/${locale}`;
  return `${prefix}/logements/${slug}`;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "stripe_unconfigured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  const checkIn = String(body.checkIn ?? "");
  const checkOut = String(body.checkOut ?? "");
  const nom = String(body.nom ?? "").trim();
  const email = String(body.email ?? "").trim();
  const telephone = String(body.telephone ?? "").trim();
  const message = String(body.message ?? "").trim();
  const locale = ["fr", "en", "es"].includes(String(body.locale)) ? String(body.locale) : "fr";
  const listingName = String(body.name ?? "").trim().slice(0, 80) || slug.replace(/-/g, " ");
  const guests = Number(body.guests);

  const logement = getLogement(slug);
  const booking = logement?.booking;

  if (!logement || !booking?.enabled) {
    return NextResponse.json({ error: "unknown_listing" }, { status: 404 });
  }
  if (!ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut)) {
    return NextResponse.json({ error: "invalid_dates" }, { status: 400 });
  }
  if (!nom || !email || !telephone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_contact" }, { status: 400 });
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > logement.guests) {
    return NextResponse.json({ error: "invalid_guests" }, { status: 400 });
  }
  const bookingWithBlocks = (await getBookingWithAvailability(slug)) ?? booking;
  if (!rangeIsAvailable(checkIn, checkOut, bookingWithBlocks)) {
    return NextResponse.json({ error: "unavailable" }, { status: 409 });
  }

  const quote = quoteStay(checkIn, checkOut, booking);
  const amount = Math.round(quote.total * 100);
  if (amount < 50) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  const origin = originFromRequest(req);
  if (!origin) {
    return NextResponse.json({ error: "missing_host" }, { status: 400 });
  }

  const path = listingPath(locale, slug);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: locale === "es" ? "es" : locale === "en" ? "en" : "fr",
      customer_email: email,
      success_url: `${origin}${path}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${path}?canceled=1`,
      invoice_creation: { enabled: true },
      metadata: {
        slug,
        checkIn,
        checkOut,
        guests: String(guests),
        nom,
        telephone,
        message: message.slice(0, 400),
        nights: String(quote.nights),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amount,
            product_data: {
              name: `${listingName} · ${checkIn} → ${checkOut}`,
              description: `${quote.nights} nuits · ${guests} voyageurs · ${nom}`,
            },
          },
        },
      ],
    });

    if (!session.url) {
      return NextResponse.json({ error: "no_checkout_url" }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error", err);
    return NextResponse.json({ error: "stripe_failed" }, { status: 502 });
  }
}
