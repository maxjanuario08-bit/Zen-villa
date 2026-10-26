import { NextResponse } from "next/server";
import { fulfillPaidBooking, getPendingBooking } from "@/lib/pending-bookings";
import { notifyBookingConfirmed } from "@/lib/site-mail";
import { CONTACT } from "@/lib/constants";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const raw=await req.text();
  if(raw.length>64000)return new NextResponse("too_large",{status:413});
  const params=new URLSearchParams(raw);
  try {
    const verification=await fetch("https://ipnpb.paypal.com/cgi-bin/webscr",{
      method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:`cmd=_notify-validate&${raw}`,signal:AbortSignal.timeout(15000),cache:"no-store"
    });
    if(!verification.ok)return new NextResponse("verification_unavailable",{status:503});
    if((await verification.text()).trim()!=="VERIFIED")return new NextResponse("invalid",{status:400});
    if(params.get("test_ipn")==="1")return new NextResponse("test_rejected",{status:400});
    if(params.get("payment_status")!=="Completed")return new NextResponse("ok");
    const receiver=(params.get("receiver_email")||params.get("business")||"").trim().toLowerCase();
    const expected=(process.env.PAYPAL_BUSINESS_EMAIL||CONTACT.email).trim().toLowerCase();
    const receiverId=process.env.PAYPAL_MERCHANT_ID?.trim();
    if(receiverId ? params.get("receiver_id")!==receiverId : receiver!==expected)return new NextResponse("receiver",{status:400});
    const transaction=(params.get("txn_id")||"").trim();
    if(!transaction || transaction.length>127)return new NextResponse("transaction",{status:400});
    const id=params.get("custom")||params.get("invoice")||"";
    const pending=await getPendingBooking(id);
    if(!pending)return new NextResponse("missing",{status:404});
    const gross=Number(params.get("mc_gross"));
    if(!params.has("mc_gross") || !Number.isFinite(gross) || params.get("mc_currency")!=="EUR" || Math.round(gross*100)!==Math.round(pending.amount*100))return new NextResponse("amount",{status:400});
    const result=await fulfillPaidBooking(id,transaction);
    if("error" in result){console.error("paypal: fulfillment failed",{bookingId:id,reason:result.error});return new NextResponse("fulfillment_pending",{status:503});}
    // Await delivery before acknowledging. PayPal retries transient errors; each
    // email recipient and stay has a stable idempotency key.
    if(!(await notifyBookingConfirmed(result.booking)))return new NextResponse("notification_pending",{status:503});
    console.info("paypal: booking confirmed",{bookingId:id,stayId:result.booking.stayId});
    return new NextResponse("ok");
  }catch{console.error("paypal: processing failed");return new NextResponse("retry",{status:503});}
}
