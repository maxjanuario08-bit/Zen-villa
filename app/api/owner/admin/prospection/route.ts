import { getProspectStages } from "@/lib/prospect-pipeline";
import { NextResponse } from "next/server";
import { adminRequestOk, getAdminSession } from "@/lib/owner-admin";
import { ownerAdminEmail } from "@/lib/owner-config";
import { listProspects, createProspect, updateProspect, convertLead, prospectTasks } from "@/lib/prospect-store";
import { filterProspects, contactAllowed } from "@/lib/prospect-model";
import { addCrmProspectLog } from "@/lib/admin-crm";

export async function GET(req:Request){
  if(!(await adminRequestOk(req)))return NextResponse.json({error:"unauthorized"},{status:401});
  const all=await listProspects();const query=new URL(req.url).searchParams;const filtered=filterProspects(all,query);
  if(query.get("id"))return NextResponse.json({lead:all.find(l=>l.id===query.get("id"))||null},{headers:{"Cache-Control":"no-store"}});
  const page=Math.max(1,Number(query.get("page"))||1);const limit=20;
  const result={stages:await getProspectStages(),leads:filtered.slice((page-1)*limit,page*limit),total:filtered.length,page,pages:Math.max(1,Math.ceil(filtered.length/limit)),tasks:await prospectTasks(),stats:{total:all.length,qualified:all.filter(l=>l.profile.qualification==="confirmed").length,contactable:all.filter(l=>contactAllowed(l,"email")||contactAllowed(l,"phone")).length,contacted:all.filter(l=>["contacted","interested","visit","won"].includes(l.status)).length,visits:all.filter(l=>l.status==="visit").length,clients:all.filter(l=>l.status==="won").length}};
  return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:Request){
  if(!(await adminRequestOk(req)))return NextResponse.json({error:"unauthorized"},{status:401});
  try{const body=await req.json();const actor=(await getAdminSession())?.email||ownerAdminEmail();
    if(body.action==="convert"){const client=await convertLead(String(body.id??""));return NextResponse.json({ok:Boolean(client),client},{status:client?200:400});}
    if(body.action==="interaction"){
      const lead=(await listProspects()).find(l=>l.id===String(body.id??""));
      if(!lead)return NextResponse.json({error:"not_found"},{status:404});
      const channel=String(body.channel??"");
      const allowed=channel==="email"?contactAllowed(lead,"email"):channel==="phone"?contactAllowed(lead,"phone"):channel==="whatsapp"?contactAllowed(lead,"phone")&&lead.profile.whatsappConsent&&Boolean(lead.profile.consentProof&&lead.profile.consentAt):false;
      if(!allowed)return NextResponse.json({error:"contact_blocked"},{status:403});
      const message=String(body.message??"").trim().slice(0,18000);
      if(!message || /\{\{[^}]+\}\}/.test(message))return NextResponse.json({error:"missing_variables"},{status:400});
      const confirmed=["confirmed","sent","completed","call_completed"].includes(body.outcome);
      const note=`${channel} — ${confirmed?"Interaction confirmée manuellement":"Brouillon préparé, envoi non confirmé"} : ${message}`;
      await addCrmProspectLog(lead.id,lead.status,note);
      if(body.nextFollowUp)await updateProspect(lead.id,{nextFollowUp:body.nextFollowUp},actor);
      return NextResponse.json({ok:true});
    }
    if(body.action==="note"){const note=String(body.message??"").trim();if(!note)return NextResponse.json({error:"note"},{status:400});const entry=await addCrmProspectLog(String(body.id??""),String(body.status??""),note);return NextResponse.json({ok:Boolean(entry)},{status:entry?200:404});}
    const result=await createProspect(body,actor);return NextResponse.json(result,{status:result.error?400:result.duplicate?409:201});
  }catch{return NextResponse.json({error:"invalid"},{status:400});}
}
export async function PATCH(req:Request){
  if(!(await adminRequestOk(req)))return NextResponse.json({error:"unauthorized"},{status:401});
  try{const body=await req.json();const actor=(await getAdminSession())?.email||ownerAdminEmail();const lead=await updateProspect(String(body.id??""),body,actor);return NextResponse.json({lead},{status:lead?200:404});}
  catch(error){return NextResponse.json({error:error instanceof Error && ["verification","owner_not_found","opposition","qualification"].includes(error.message)?error.message:"invalid"},{status:400});}
}
