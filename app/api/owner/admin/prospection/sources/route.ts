import { NextResponse } from "next/server";
import { adminRequestOk } from "@/lib/owner-admin";
import snapshot from "@/data/prospection/santa-giulia.json";
export async function GET(req:Request){
 if(!(await adminRequestOk(req)))return NextResponse.json({error:"unauthorized"},{status:401});
 // Audited, licensed snapshot only. Never fetch arbitrary URLs supplied by a browser.
 return NextResponse.json({...snapshot,mode:"snapshot",liveApiConfigured:Boolean(process.env.DATATOURISME_API_KEY)},{headers:{"Cache-Control":"no-store"}});
}
