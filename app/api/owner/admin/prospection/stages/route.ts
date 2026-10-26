import { NextResponse } from "next/server";
import { adminRequestOk } from "@/lib/owner-admin";
import { saveProspectStages } from "@/lib/prospect-pipeline";
export async function POST(req:Request){if(!(await adminRequestOk(req)))return NextResponse.json({error:'unauthorized'},{status:401});try{return NextResponse.json({stages:await saveProspectStages((await req.json()).stages)});}catch{return NextResponse.json({error:'invalid_stages'},{status:400});}}
