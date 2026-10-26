import ExcelJS from "exceljs";
import type { Prospect, ProspectTask } from "@/lib/prospect-model";
import { contactAllowed } from "@/lib/prospect-model";

export function safeCell(value: unknown) {
  const s=String(value??"");return /^[\s\u0000-\u001f]*[=+@-]/.test(s)?`'${s}`:s;
}
export function csvDocument(rows: unknown[][]) { return "\ufeff"+rows.map(row=>row.map(v=>`"${safeCell(v).replace(/"/g,'""')}"`).join(";")).join("\r\n"); }
export function parseCsv(source:string):string[][] {
  if(source.length>2_000_000)throw new Error("size");
  const first=source.split(/\r?\n/)[0];const delimiter=(first.match(/;/g)||[]).length>=(first.match(/,/g)||[]).length?";":",";
  const rows:string[][]=[];let row:string[]=[];let cell="";let quoted=false;
  for(let i=0;i<source.length;i++){const char=source[i];if(char==='"'){if(quoted&&source[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(char===delimiter&&!quoted){row.push(cell);cell="";}
    else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&source[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell="";}
    else cell+=char;
    if(rows.length>1000)throw new Error("rows");}
  if(quoted)throw new Error("csv");row.push(cell);if(row.some(Boolean))rows.push(row);if(rows[0]?.[0])rows[0][0]=rows[0][0].replace(/^\ufeff/,"");return rows;
}
export const EXPORT_HEADERS=["id","logement","zone","type","statut","qualification","exploitant","email_professionnel","telephone_professionnel","site_officiel","adresse","source_url","producteur","licence","collecte_le","source_mise_a_jour","verifie_le","relance","contact_autorise"];
export function prospectExportRow(lead:Prospect) {
  const email=contactAllowed(lead,"email");const phone=contactAllowed(lead,"phone");
  return [lead.id,lead.property,lead.zone,lead.profile.propertyType,lead.status,lead.profile.qualification,email||phone?lead.name:"",email&&lead.profile.emailNature==="professional"?lead.email:"",phone&&lead.profile.phoneNature==="professional"?lead.phone:"",lead.profile.website,lead.profile.address,lead.profile.sourceUrl,lead.profile.sourcePublisher,lead.profile.sourceLicense,lead.profile.collectedAt,lead.profile.sourceUpdatedAt,lead.profile.verifiedAt,lead.nextFollowUp,email||phone?"oui":"non"];
}
export async function workbookExport(leads:Prospect[],tasks:ProspectTask[]) {
  const book=new ExcelJS.Workbook();book.creator="Zenvilla";book.created=new Date();
  function add(name:string,headers:string[],rows:unknown[][]){const sheet=book.addWorksheet(name);sheet.addRow(headers);for(const row of rows)sheet.addRow(row.map(safeCell));sheet.views=[{state:"frozen",ySplit:1}];sheet.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,sheet.rowCount),column:headers.length}};sheet.getRow(1).font={bold:true,color:{argb:"FFFFFFFF"}};sheet.getRow(1).fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF184E58"}};sheet.columns.forEach(c=>{c.width=24;});}
  add("Logements",EXPORT_HEADERS,leads.map(prospectExportRow));
  add("Contacts validés",["id","exploitant","email_professionnel","telephone_professionnel","nature_exploitant","base_legale","verifie_le"],leads.filter(l=>!l.suppressed&&(contactAllowed(l,"email")&&l.profile.emailNature==="professional"||contactAllowed(l,"phone")&&l.profile.phoneNature==="professional")).map(l=>[l.profile.contactId,l.name,contactAllowed(l,"email")&&l.profile.emailNature==="professional"?l.email:"",contactAllowed(l,"phone")&&l.profile.phoneNature==="professional"?l.phone:"",l.profile.operatorType,l.profile.lawfulBasis,l.profile.verifiedAt]));
  add("Sources",["logement_id","champ","url","producteur","licence","collecte_le","mise_a_jour_source","verifie_le"],leads.flatMap(l=>l.profile.evidence.map(e=>[l.id,e.field,e.url,e.publisher,e.license,e.collectedAt,e.sourceUpdatedAt,e.checkedAt])));
  add("Suivi",["logement_id","logement","statut","relance","taches_en_attente","exporte_le"],leads.map(l=>[l.id,l.property,l.status,l.nextFollowUp,tasks.filter(t=>t.prospectId===l.id&&!t.done).length,new Date().toISOString()]));
  const bytes=await book.xlsx.writeBuffer();return new Uint8Array(bytes);
}
export async function importFile(file:File) {
  if(file.size>2_000_000)throw new Error("size");
  let rows:string[][];
  if(file.name.toLowerCase().endsWith(".xlsx")){const book=new ExcelJS.Workbook();await book.xlsx.load(await file.arrayBuffer());const sheet=book.worksheets[0];if(!sheet||sheet.rowCount>1001)throw new Error("rows");rows=[];sheet.eachRow(r=>{const cells:string[]=[];for(let c=1;c<=Math.min(sheet.columnCount,40);c++){const cell=r.getCell(c);cells.push(cell.type===ExcelJS.ValueType.Formula?"":cell.text);}rows.push(cells);});}
  else if(file.name.toLowerCase().endsWith(".csv"))rows=parseCsv(await file.text());else throw new Error("format");
  const headers=rows.shift()?.map(s=>s.trim().toLowerCase())??[];
  if(!headers.includes("logement")&&!headers.includes("property"))throw new Error("headers");
  return rows.filter(r=>r.some(Boolean)).slice(0,1000).map(row=>{const get=(...keys:string[])=>{for(const key of keys){const index=headers.indexOf(key);if(index>=0&&row[index])return row[index];}return "";};return {property:get("logement","property"),name:get("exploitant","name"),email:get("email","email_professionnel"),phone:get("telephone","phone","telephone_professionnel"),zone:get("zone")||"santa-giulia",source:"web",notes:get("notes"),profile:{propertyType:get("type")||"unknown",website:get("site_officiel","website"),address:get("adresse","address"),sourceUrl:get("source_url"),sourcePublisher:get("producteur"),sourceLicense:get("licence"),sourceUpdatedAt:get("source_mise_a_jour"),sourceId:get("source_id"),evidence:[]}};});
}
