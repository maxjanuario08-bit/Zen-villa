import { NextResponse } from "next/server";
import { adminRequestOk, getAdminSession } from "@/lib/owner-admin";
import { createProspect } from "@/lib/prospect-store";
import { ownerAdminEmail } from "@/lib/owner-config";
import { importFile } from "@/lib/prospect-files";
export async function POST(req:Request){
 if(!(await adminRequestOk(req)))return NextResponse.json({error:"unauthorized"},{status:401});
 try{if(req.headers.get("content-type")?.includes("multipart/form-data")){const data=await req.formData();const file=data.get("file");if(!(file instanceof File))throw new Error("file");const records=await importFile(file);return NextResponse.json({records,total:records.length});}
  const body=await req.json();if(body.authorized!==true||!Array.isArray(body.records)||body.records.length>20)throw new Error("authorization");
  const actor=(await getAdminSession())?.email||ownerAdminEmail();const result={added:0,duplicates:0,errors:0};
  for(const input of body.records){const res=await createProspect(input,actor,true);if(res.lead)result.added++;else if(res.duplicate)result.duplicates++;else result.errors++;}
  return NextResponse.json(result);
 }catch(error){return NextResponse.json({error:error instanceof Error && ["file","size","rows","csv","format","headers","authorization"].includes(error.message)?error.message:"invalid"},{status:400});}
}
