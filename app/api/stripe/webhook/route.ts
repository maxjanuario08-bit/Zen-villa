import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "webhook_unconfigured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const body = await req.text();
  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.info("stay paid", {
        id: session.id,
        slug: session.metadata?.slug,
        checkIn: session.metadata?.checkIn,
        checkOut: session.metadata?.checkOut,
        email: session.customer_details?.email ?? session.customer_email,
      });
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("stripe webhook", err);
    return NextResponse.json({ error: "invalid_webhook" }, { status: 400 });
  }
}
