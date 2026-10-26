import { localCrmPath } from "@/lib/local-crm-path";
import { getProspectStages } from "@/lib/prospect-pipeline";
import { findAccountByEmail } from "@/lib/owner-accounts";
import { createHash, randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { pg, usePostgres as hasPostgres } from "@/lib/owner-pg";
import { listCrmProspects, createCrmProspect, updateCrmProspect, addCrmProspectLog, convertProspectToClient } from "@/lib/admin-crm";
import { EMPTY_PROFILE, normalizePhone, normalizeKey, safeWebUrl, contactAllowed, LEAD_STATUSES, PROPERTY_TYPES, OPERATOR_TYPES, PROSPECT_ZONES, type Prospect, type ProspectProfile, type ProspectTask } from "@/lib/prospect-model";

const localPath = localCrmPath("prospection.json");
type Local = { profiles: Record<string, ProspectProfile>; oppositions: string[]; tasks: ProspectTask[]; contacts: Record<string, { name: string; phone: string; email: string }> };
const blank = (): Local => ({ profiles: {}, oppositions: [], tasks: [], contacts: {} });
async function readLocal(): Promise<Local> { try { return { ...blank(), ...JSON.parse(await fs.readFile(localPath, "utf8")) }; } catch { return blank(); } }
async function writeLocal(data: Local) { await fs.mkdir(path.dirname(localPath), { recursive: true }); await fs.writeFile(localPath, JSON.stringify(data), { mode: 0o600 }); }
const text = (value: unknown, max = 2000) => typeof value === "string" ? value.trim().slice(0,max) : "";
const oneOf = <T extends string>(value: unknown, values: readonly T[], fallback: T): T => values.includes(value as T) ? value as T : fallback;
const date = (value: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(text(value)) && !Number.isNaN(Date.parse(`${text(value)}T12:00:00Z`)) ? text(value) : "";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const json = (raw: unknown) => { try { return JSON.parse(String(raw ?? "{}")); } catch { return {}; } };
export function normalizeProfile(input: unknown, base: ProspectProfile = EMPTY_PROFILE): ProspectProfile {
  const raw = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const p = { ...base };
  for (const key of ["firstName","lastName","salutation","services","appointmentTime","propertyId","contactId","sourceId","sourceLicense","sourcePublisher","verifiedBy","consentProof","lawfulBasisNote","expressedNeed","address","ownerEmail","clientId"] as const) if (key in raw) p[key] = text(raw[key]);
  for (const key of ["appointmentDate","collectedAt","sourceUpdatedAt","verifiedAt","consentAt","informedAt","expiresAt"] as const) if (key in raw) p[key] = date(raw[key]);
  for (const key of ["website","sourceUrl"] as const) if (key in raw) p[key] = safeWebUrl(raw[key]);
  if ("propertyType" in raw) p.propertyType = oneOf(raw.propertyType, PROPERTY_TYPES,"unknown");
  if ("operatorType" in raw) p.operatorType = oneOf(raw.operatorType, OPERATOR_TYPES,"unknown");
  for (const key of ["phoneNature","emailNature"] as const) if (key in raw) p[key] = oneOf(raw[key],["unknown","professional","personal"],"unknown");
  if ("lawfulBasis" in raw) p.lawfulBasis = oneOf(raw.lawfulBasis,["unknown","consent","legitimate-interest"],"unknown");
  if ("qualification" in raw) p.qualification = oneOf(raw.qualification,["unreviewed","reviewed","confirmed"],"unreviewed");
  if ("management" in raw) p.management = oneOf(raw.management,["unknown","self","delegated"],"unknown");
  for (const key of ["emailConsent","phoneConsent","whatsappConsent"] as const) if (key in raw) p[key] = raw[key] === true;
  if (Array.isArray(raw.evidence)) p.evidence = raw.evidence.slice(0,100).filter(e => e && typeof e === "object").map(e => ({ field: text(e.field,50), value: text(e.value,500), url: safeWebUrl(e.url), publisher: text(e.publisher,200), license: text(e.license,200), sourceUpdatedAt: date(e.sourceUpdatedAt), collectedAt: date(e.collectedAt), checkedAt: date(e.checkedAt) })).filter(e => e.url && e.field);
  return p;
}
export function oppositionKeys(lead: Pick<Prospect,"email"|"phone"|"profile">) {
  return [lead.email ? `email:${lead.email.trim().toLowerCase()}` : "", lead.phone ? `phone:${normalizePhone(lead.phone)}` : "", lead.profile.contactId ? `contact:${lead.profile.contactId}` : ""].filter(Boolean).map(hash);
}
export async function listProspects(): Promise<Prospect[]> {
  const basic = await listCrmProspects();
  let profiles: Record<string, ProspectProfile> = {}; let oppositions: string[] = []; let contacts: Local["contacts"] = {};
  if (hasPostgres()) {
    const sql = await pg();
    const [rows, blocked, people] = await Promise.all([sql`SELECT id, profile_json, client_id FROM crm_prospects`,sql`SELECT fingerprint FROM crm_oppositions`,sql`SELECT id, data_json FROM crm_contact_records`]);
    for (const row of rows) profiles[String(row.id)] = normalizeProfile({ ...json(row.profile_json), clientId: String(row.client_id ?? "") });
    oppositions = blocked.map(row => String(row.fingerprint));
    for (const row of people) contacts[String(row.id)] = json(row.data_json);
  } else { const local = await readLocal(); profiles=local.profiles; oppositions=local.oppositions; contacts=local.contacts; }
  const blocked = new Set(oppositions);
  return basic.map(lead => {
    const profile = normalizeProfile(profiles[lead.id]);
    const contact = contacts[profile.contactId];
    const next = { ...lead, ...(contact ? { name: contact.name, email: contact.email, phone: contact.phone } : {}), profile, suppressed: false };
    next.suppressed = lead.status === "opted-out" || oppositionKeys(next).some(key => blocked.has(key));
    return next;
  });
}
async function storeProfile(lead: Prospect) {
  if (hasPostgres()) {
    const sql=await pg();
    await sql`UPDATE crm_prospects SET profile_json=${JSON.stringify(lead.profile)} WHERE id=${lead.id}`;
    await sql`INSERT INTO crm_contact_records(id,data_json) VALUES(${lead.profile.contactId},${JSON.stringify({name:lead.name,email:lead.email,phone:lead.phone})}) ON CONFLICT(id) DO UPDATE SET data_json=EXCLUDED.data_json,updated_at=NOW()`;
    await sql`INSERT INTO crm_property_records(id,data_json) VALUES(${lead.profile.propertyId},${JSON.stringify({name:lead.property,type:lead.profile.propertyType,address:lead.profile.address,website:lead.profile.website,evidence:lead.profile.evidence})}) ON CONFLICT(id) DO UPDATE SET data_json=EXCLUDED.data_json,updated_at=NOW()`;
  } else { const local=await readLocal();local.profiles[lead.id]=lead.profile;local.contacts[lead.profile.contactId]={name:lead.name,email:lead.email,phone:lead.phone};await writeLocal(local); }
}
export async function createProspect(input: Record<string, unknown>, actor: string, imported = false): Promise<{ lead?: Prospect; duplicate?: string; error?: string }> {
  const profile=normalizeProfile(input.profile);
  if (imported) { profile.qualification="unreviewed";profile.verifiedAt="";profile.verifiedBy="";profile.lawfulBasis="unknown";profile.emailConsent=false;profile.phoneConsent=false;profile.whatsappConsent=false; }
  const property=text(input.property,120); const name=text(input.name,80) || "Exploitant à identifier";
  if (property.length<2) return {error:"property"};
  const existing=await listProspects();
  const duplicate=existing.find(row => (profile.sourceId && row.profile.sourceId===profile.sourceId) || (row.zone===input.zone && normalizeKey(row.property)===normalizeKey(property) && (profile.address && normalizeKey(row.profile.address)===normalizeKey(profile.address) || profile.website && row.profile.website===profile.website)));
  if (duplicate) return {duplicate:duplicate.id};
  profile.collectedAt ||= new Date().toISOString().slice(0,10);
  profile.expiresAt ||= `${Number(profile.collectedAt.slice(0,4))+3}${profile.collectedAt.slice(4)}`;
  profile.propertyId = hash(`property:${profile.sourceId || `${normalizeKey(property)}:${normalizeKey(profile.address)}:${profile.website}`}`).slice(0,24);
  const email=text(input.email,120).toLowerCase(); const phone=normalizePhone(text(input.phone,40));
  profile.contactId = email ? hash(`email:${email}`).slice(0,24) : phone ? hash(`phone:${phone}`).slice(0,24) : randomBytes(12).toString("hex");
  if (profile.verifiedAt) profile.verifiedBy=actor;
  const lead = await createCrmProspect({name,email,phone,property,zone:oneOf(input.zone,PROSPECT_ZONES,"other"),source: text(input.source,40)||"web",status:"new",notes:text(input.notes,1000),nextFollowUp:date(input.nextFollowUp)});
  if ("error" in lead) return {error:"invalid"};
  const record:Prospect={...lead,profile,suppressed:false};
  record.suppressed=existing.some(row=>row.suppressed && oppositionKeys(row).some(key=>oppositionKeys(record).includes(key)));
  try { await storeProfile(record); } catch(error) { // A concurrent import may have inserted the same external ID.
    if (profile.sourceId && hasPostgres()) { const sql=await pg();const rows=await sql`SELECT id FROM crm_prospects WHERE profile_json::jsonb->>'sourceId'=${profile.sourceId} AND id<>${record.id}`;
      if(rows.length){await sql`DELETE FROM crm_prospect_log WHERE prospect_id=${record.id}`;await sql`DELETE FROM crm_prospects WHERE id=${record.id}`;return {duplicate:String(rows[0].id)};}}
    throw error;
  }
  return {lead:record};
}
export async function updateProspect(id:string,input:Record<string,unknown>,actor:string) {
  const current=(await listProspects()).find(row=>row.id===id); if(!current)return null;
  const profile=normalizeProfile(input.profile,current.profile);
  // IDs and linkage cannot be replaced by a form submission.
  profile.contactId=current.profile.contactId || randomBytes(12).toString("hex");profile.propertyId=current.profile.propertyId || randomBytes(12).toString("hex");profile.clientId=current.profile.clientId;
  if(profile.qualification!=="unreviewed" && (!profile.sourceUrl || !profile.verifiedAt)) throw new Error("verification");
  if(profile.ownerEmail && !(await findAccountByEmail(profile.ownerEmail.toLowerCase())))throw new Error("owner_not_found");
  if(profile.verifiedAt)profile.verifiedBy=actor;
  const stages=await getProspectStages();
  const status=typeof input.status==="string" && (stages.some(s=>s.id===input.status)||LEAD_STATUSES.includes(input.status as typeof LEAD_STATUSES[number]))?input.status:current.status;
  if(current.suppressed && status!=="opted-out" && input.status!==undefined)throw new Error("opposition");
  const nextEmail=input.email===undefined?current.email:text(input.email,120).toLowerCase();
  const nextPhone=input.phone===undefined?current.phone:normalizePhone(text(input.phone,40));
  // Changing a coordinate invalidates the previous channel verification and consent.
  if(nextEmail!==current.email && !profile.evidence.some(e=>e.field==="email"&&e.value?.toLowerCase()===nextEmail&&e.checkedAt)){profile.emailNature="unknown";profile.emailConsent=false;profile.evidence=profile.evidence.filter(e=>e.field!=="email");}
  if(nextPhone!==current.phone && !profile.evidence.some(e=>e.field==="phone"&&normalizePhone(e.value||"")===nextPhone&&e.checkedAt)){profile.phoneNature="unknown";profile.phoneConsent=false;profile.whatsappConsent=false;profile.evidence=profile.evidence.filter(e=>e.field!=="phone");}
  profile.evidence=Array.from(new Map([...current.profile.evidence,...profile.evidence].map(e=>[`${e.field}:${e.url}:${e.value||""}`,e])).values()).slice(-100);
  if(nextEmail!==current.email)profile.evidence=profile.evidence.filter(e=>e.field!=="email" || e.value===nextEmail);
  if(nextPhone!==current.phone)profile.evidence=profile.evidence.filter(e=>e.field!=="phone" || normalizePhone(e.value||"")===nextPhone);
  const basic=await updateCrmProspect(id,{name:input.name===undefined?current.name:text(input.name,80),email:nextEmail,phone:nextPhone,property:input.property===undefined?current.property:text(input.property,120),zone:oneOf(input.zone,PROSPECT_ZONES,current.zone as typeof PROSPECT_ZONES[number]),status,nextFollowUp:input.nextFollowUp===undefined?current.nextFollowUp:date(input.nextFollowUp),notes:input.notes===undefined?current.notes:text(input.notes,1000)});
  if(!basic)return null;
  const lead:Prospect={...basic,profile,suppressed:current.suppressed || status==="opted-out"};
  await storeProfile(lead);
  if(status==="opted-out"){
    const keys=oppositionKeys(lead);
    if(hasPostgres()){const sql=await pg();for(const key of keys)await sql`INSERT INTO crm_oppositions(fingerprint) VALUES(${key}) ON CONFLICT DO NOTHING`;}
    else {const local=await readLocal();local.oppositions=Array.from(new Set([...local.oppositions,...keys]));await writeLocal(local);}
  }
  await addCrmProspectLog(id,status,`Fiche mise à jour par ${actor}`);
  return lead;
}
export async function convertLead(id:string) {
  const lead=(await listProspects()).find(row=>row.id===id);
  if(!lead || lead.suppressed || lead.profile.qualification!=="confirmed")throw new Error("qualification");
  await updateCrmProspect(id,{name:lead.name,email:lead.email,phone:lead.phone});
  return convertProspectToClient(id);
}
export async function prospectTasks() {
  if(!hasPostgres())return (await readLocal()).tasks;
  const sql=await pg();const rows=await sql`SELECT * FROM crm_tasks ORDER BY done,due,created_at DESC`;
  return rows.map(r=>({id:String(r.id),prospectId:String(r.prospect_id),title:String(r.title),due:String(r.due),done:Boolean(r.done),createdAt:new Date(String(r.created_at)).toISOString()}));
}
export async function saveTask(input:Record<string,unknown>) {
  const prospectId=text(input.prospectId,80);if(!(await listProspects()).some(row=>row.id===prospectId))throw new Error("not_found");
  const existing=(await prospectTasks()).find(t=>t.id===input.id && t.prospectId===prospectId);
  const task:ProspectTask={id:existing?.id || randomBytes(12).toString("hex"),prospectId,title:text(input.title??existing?.title,200),due:date(input.due??existing?.due),done:input.done===true,createdAt:existing?.createdAt||new Date().toISOString()};
  if(!task.title)throw new Error("title");
  if(hasPostgres()){const sql=await pg();await sql`INSERT INTO crm_tasks(id,prospect_id,title,due,done) VALUES(${task.id},${task.prospectId},${task.title},${task.due},${task.done}) ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,due=EXCLUDED.due,done=EXCLUDED.done`;}
  else{const local=await readLocal();local.tasks=[task,...local.tasks.filter(t=>t.id!==task.id)];await writeLocal(local);}return task;
}
export { contactAllowed };
