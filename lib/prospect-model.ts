import type { CrmProspect } from "@/lib/admin-crm-types";

export const PROSPECT_ZONES = ["santa-giulia", "palombaggia", "bocca-piccovaggia", "porto-vecchio", "lecci-cala-rossa", "other"] as const;
export const PROPERTY_TYPES = ["villa", "mini-villa", "apartment", "residence", "other", "unknown"] as const;
export const OPERATOR_TYPES = ["unknown", "private", "independent", "agency", "large-manager"] as const;
export const LEAD_STATUSES = ["new", "qualified", "contacted", "interested", "visit", "quote", "followup", "won", "lost", "opted-out"] as const;
export type Evidence = { field: string; url: string; publisher: string; license: string; sourceUpdatedAt: string; collectedAt: string; checkedAt: string; value?: string };
export type ProspectProfile = {
  propertyId: string; contactId: string; propertyType: string; operatorType: string;
  website: string; address: string; sourceUrl: string; sourceId: string; sourceLicense: string; sourcePublisher: string;
  collectedAt: string; sourceUpdatedAt: string; verifiedAt: string; verifiedBy: string;
  phoneNature: "unknown" | "professional" | "personal";
  emailNature: "unknown" | "professional" | "personal";
  emailConsent: boolean; phoneConsent: boolean; consentProof: string; consentAt: string;
  lawfulBasis: "unknown" | "consent" | "legitimate-interest"; lawfulBasisNote: string;
  informedAt: string; expiresAt: string; qualification: "unreviewed" | "reviewed" | "confirmed";
  firstName: string; lastName: string; salutation: string; services: string; appointmentDate: string; appointmentTime: string; whatsappConsent: boolean;
  management: "unknown" | "self" | "delegated"; expressedNeed: string;
  evidence: Evidence[]; ownerEmail: string; clientId: string;
};
export type Prospect = CrmProspect & { profile: ProspectProfile; suppressed: boolean };
export type ProspectTask = { id: string; prospectId: string; title: string; due: string; done: boolean; createdAt: string };
export const EMPTY_PROFILE: ProspectProfile = {
  propertyId: "", contactId: "", propertyType: "unknown", operatorType: "unknown", website: "", address: "", sourceUrl: "", sourceId: "", sourceLicense: "", sourcePublisher: "",
  collectedAt: "", sourceUpdatedAt: "", verifiedAt: "", verifiedBy: "", phoneNature: "unknown", emailNature: "unknown", emailConsent: false, phoneConsent: false, consentProof: "", consentAt: "",
  firstName: "", lastName: "", salutation: "", services: "", appointmentDate: "", appointmentTime: "", whatsappConsent: false,
  lawfulBasis: "unknown", lawfulBasisNote: "", informedAt: "", expiresAt: "", qualification: "unreviewed", management: "unknown", expressedNeed: "", evidence: [], ownerEmail: "", clientId: "",
};
export function safeWebUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 2000) return "";
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : ""; } catch { return ""; }
}
export function normalizePhone(value: string) {
  const compact = value.replace(/[^+\d]/g, "");
  return compact.startsWith("00") ? `+${compact.slice(2)}` : /^0\d{9}$/.test(compact) ? `+33${compact.slice(1)}` : compact;
}
export function normalizeKey(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
export function contactAllowed(lead: Prospect, channel: "email" | "phone", now = new Date()) {
  const p = lead.profile;
  if (lead.suppressed || lead.status === "opted-out" || !p.verifiedAt || p.qualification === "unreviewed" || !p.lawfulBasisNote || !p.expiresAt || p.expiresAt < now.toISOString().slice(0, 10)) return false;
  if (!p.evidence.some(e => e.field === channel && safeWebUrl(e.url) && e.checkedAt && (channel === "email" ? (e.value ?? "").toLowerCase() === lead.email.toLowerCase() : normalizePhone(e.value ?? "") === normalizePhone(lead.phone)))) return false;
  const value = channel === "email" ? lead.email : lead.phone;
  if (!value) return false;
  if (p.lawfulBasis === "consent" && p.consentProof && p.consentAt) return channel === "email" ? p.emailConsent : p.phoneConsent;
  return p.lawfulBasis === "legitimate-interest" && p.operatorType === "independent" && (channel === "email" ? p.emailNature : p.phoneNature) === "professional";
}
export function priorityScore(lead: Prospect) {
  if (lead.suppressed || lead.status === "opted-out" || ["agency", "large-manager"].includes(lead.profile.operatorType)) return 0;
  return (lead.zone === "santa-giulia" ? 30 : lead.zone !== "other" ? 15 : 0) + (lead.profile.operatorType === "independent" && lead.profile.verifiedAt ? 20 : 0)
    + (contactAllowed(lead, "email") || contactAllowed(lead, "phone") ? 20 : 0)
    + (lead.profile.verifiedAt && lead.profile.management === "self" ? 15 : 0) + (lead.profile.expressedNeed && lead.profile.verifiedAt ? 15 : 0);
}
export function mapsSearchUrl(lead: Prospect) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([lead.property || lead.name, lead.profile.address || lead.zone, "Corse"].filter(Boolean).join(" "))}`; }
export function filterProspects(leads: Prospect[], query: URLSearchParams) {
  const search = normalizeKey(query.get("q") ?? "");
  return leads.filter(lead => (!search || normalizeKey(`${lead.name} ${lead.property} ${lead.email} ${lead.phone} ${lead.profile.address}`).includes(search))
    && (!query.get("zone") || lead.zone === query.get("zone")) && (!query.get("status") || lead.status === query.get("status"))
    && (!query.get("type") || lead.profile.propertyType === query.get("type")) && (!query.get("operator") || lead.profile.operatorType === query.get("operator"))
    && (!query.get("qualification") || lead.profile.qualification === query.get("qualification"))
    && (!query.get("source") || lead.source === query.get("source"))
    && (query.get("email") !== "yes" || Boolean(lead.email && lead.profile.emailNature === "professional" && lead.profile.evidence.some(e => e.field === "email" && e.checkedAt)))
    && (query.get("phone") !== "yes" || Boolean(lead.phone && lead.profile.phoneNature === "professional" && lead.profile.evidence.some(e => e.field === "phone" && e.checkedAt)))
    && (query.get("due") !== "yes" || Boolean(lead.nextFollowUp && lead.nextFollowUp <= new Date().toISOString().slice(0,10) && !["won","lost","opted-out"].includes(lead.status))))
    .sort((a,b) => priorityScore(b) - priorityScore(a) || (a.nextFollowUp || "9999").localeCompare(b.nextFollowUp || "9999") || b.updatedAt.localeCompare(a.updatedAt));
}
