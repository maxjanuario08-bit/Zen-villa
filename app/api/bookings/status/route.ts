import { NextResponse } from "next/server";
import { getPendingBooking } from "@/lib/pending-bookings";
export const dynamic="force-dynamic";
export async function GET(req:Request){
 const id=new URL(req.url).searchParams.get("id")||"";
 if(!/^[a-f0-9]{24}$/.test(id))return NextResponse.json({error:"invalid"},{status:400});
 const booking=await getPendingBooking(id);
 // Opaque 96-bit reference; expose no guest identity, contact or financial details.
 return NextResponse.json({status:booking?.status||"unknown"},{headers:{"Cache-Control":"private, no-store"}});
}
