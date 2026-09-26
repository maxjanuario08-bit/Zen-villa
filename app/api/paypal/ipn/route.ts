import { NextResponse } from "next/server";
import { fulfillPaidBooking, getPendingBooking } from "@/lib/pending-bookings";
import { notifyBookingConfirmed } from "@/lib/site-mail";

export const runtime = "nodejs";

function formValue(params: URLSearchParams, key: string) {
  return params.get(key) ?? "";
}

async function paypalVerified(body: string) {
  const res = await fetch("https://ipnpb.paypal.com/cgi-bin/webscr", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `cmd=_notify-validate&${body}`,
  });
  const text = (await res.text()).trim();
  return text === "VERIFIED";
}

export async function POST(req: Request) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);
  if (!(await paypalVerified(raw))) {
    return new NextResponse("invalid", { status: 400 });
  }

  const status = formValue(params, "payment_status");
  if (status !== "Completed") {
    return new NextResponse("ok", { status: 200 });
  }

  const id = formValue(params, "custom") || formValue(params, "invoice");
  const pending = await getPendingBooking(id);
  if (!pending) {
    return new NextResponse("missing", { status: 404 });
  }

  const gross = Number(formValue(params, "mc_gross"));
  const currency = formValue(params, "mc_currency");
  if (currency !== "EUR" || Math.abs(gross - pending.amount) > 0.05) {
    return new NextResponse("amount", { status: 400 });
  }

  const result = await fulfillPaidBooking(id);
  if ("error" in result) {
    return new NextResponse("ok", { status: 200 });
  }
  if (result.fresh) void notifyBookingConfirmed(result.booking);
  return new NextResponse("ok", { status: 200 });
}
