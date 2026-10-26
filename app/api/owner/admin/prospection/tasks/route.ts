import { NextResponse } from "next/server";
import { adminRequestOk } from "@/lib/owner-admin";
import { saveTask } from "@/lib/prospect-store";
export async function POST(req:Request){if(!(await adminRequestOk(req)))return NextResponse.json({error:"unauthorized"},{status:401});try{return NextResponse.json({task:await saveTask(await req.json())});}catch{return NextResponse.json({error:"invalid"},{status:400});}}
