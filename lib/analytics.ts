export const GOOGLE_ANALYTICS_ID = "G-0EWN4TFMJ2";
export const COOKIE_CONSENT_KEY = "zenvilla-cookie-consent";

export function analyticsPublicPath(pathname: string) {
  const path = pathname.replace(/^\/(en|es|fr)(?=\/|$)/, "") || "/";
  return !/^\/(admin|compte|equipe|connexion|inscription|mot-de-passe-oublie|reinitialiser-mot-de-passe)(\/|$)/.test(path);
}

export const ANALYTICS_OPTOUT_KEY = "zenvilla-analytics-optout";
export function analyticsEnabled() {
  try { return localStorage.getItem(COOKIE_CONSENT_KEY)==="accepted" && localStorage.getItem(ANALYTICS_OPTOUT_KEY)!=="1"; } catch { return false; }
}
/** Keep only the campaign values distributed by Zenvilla, never arbitrary query values. */
export function analyticsPageLocation(origin:string,pathname:string,search="") {
 const params=new URLSearchParams(search), safe=new URLSearchParams();
 const sources=["instagram","facebook","flyer","google"], media=["social","offline","organic","cpc","email"];
 if(sources.includes(params.get("utm_source") || ""))safe.set("utm_source",params.get("utm_source")!);
 if(safe.has("utm_source")&&media.includes(params.get("utm_medium") || ""))safe.set("utm_medium",params.get("utm_medium")!);
 if(safe.has("utm_source")&&params.get("utm_campaign")==="prospection")safe.set("utm_campaign","prospection");
 return `${origin}${pathname}${safe.size?`?${safe}`:""}`;
}
export function analyticsReferrer(referrer:string,origin:string) {
 try { const url=new URL(referrer);return url.protocol==="https:"&&url.origin!==origin?`${url.origin}/`:""; } catch { return ""; }
}
export type SiteEvent = "generate_lead" | "lead_form_start" | "contact_whatsapp" | "contact_phone" | "contact_email" | "appointment_click" | "assistant_open" | "assistant_no_result";
export function contactEvent(href:string):SiteEvent|null {
 if(href.startsWith("tel:"))return "contact_phone";
 if(href.startsWith("mailto:"))return "contact_email";
 try { const url=new URL(href);if(url.protocol!=="https:")return null;
  if(["wa.me","api.whatsapp.com"].includes(url.hostname))return "contact_whatsapp";
  if(url.hostname==="calendar.app.google" || (url.hostname==="calendar.google.com"&&url.pathname.includes("/appointments/schedules/")))return "appointment_click";
 } catch { /* Relative links and unknown destinations are not contact events. */ }
 return null;
}
export function trackSiteEvent(name:SiteEvent,formType?:"contact"|"service") {
 try {
  if(!analyticsEnabled() || !analyticsPublicPath(window.location.pathname))return;
  const target=window as Window & {gtag?:(...args:unknown[])=>void};
  // No user names, addresses, phone numbers, link destinations or search text.
  target.gtag?.("event",name,{send_to:GOOGLE_ANALYTICS_ID,page_location:`${window.location.origin}${window.location.pathname}`,...(formType?{form_type:formType}:{})});
 } catch { /* Analytics must never interrupt a contact or reservation. */ }
}


const INQUIRY_SOURCE_KEY = "zenvilla-inquiry-source";
export function rememberInquirySource(pageLocation: string) {
  try {
    const source = new URL(pageLocation).searchParams.get("utm_source");
    if (analyticsEnabled() && source) sessionStorage.setItem(INQUIRY_SOURCE_KEY, source);
  } catch { /* The form can still be sent with browser storage disabled. */ }
}

export function inquirySource() {
  try {
    return analyticsEnabled() ? sessionStorage.getItem(INQUIRY_SOURCE_KEY) ?? "" : "";
  } catch { return ""; }
}
