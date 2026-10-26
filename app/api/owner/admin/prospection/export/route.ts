import { NextResponse } from "next/server";
import { adminRequestOk } from "@/lib/owner-admin";
import { listProspects, prospectTasks } from "@/lib/prospect-store";
import { filterProspects } from "@/lib/prospect-model";
import { workbookExport, csvDocument, EXPORT_HEADERS, prospectExportRow } from "@/lib/prospect-files";
export async function GET(req:Request){
 if(!(await adminRequestOk(req)))return NextResponse.json({error:"unauthorized"},{status:401});
 const params=new URL(req.url).searchParams;const leads=filterProspects(await listProspects(),params).filter(l=>!l.suppressed);const xlsx=params.get("format")==="xlsx";
 const body=xlsx?await workbookExport(leads,await prospectTasks()):csvDocument([EXPORT_HEADERS,...leads.map(prospectExportRow)]);
 return new Response(body,{headers:{"Content-Type":xlsx?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="zenvilla-prospection-${new Date().toISOString().slice(0,10)}.${xlsx?"xlsx":"csv"}"`,"Cache-Control":"no-store"}});
}
