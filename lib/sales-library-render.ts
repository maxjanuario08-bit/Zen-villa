import type { SalesTemplate, SalesSettings } from "@/lib/sales-library-types";
const central:Record<string,keyof SalesSettings>={entreprise:"brand",site_zenvilla:"website",email_zenvilla:"email",telephone_zenvilla:"phone",zone_zenvilla:"zone",objectif_zenvilla:"objective",tarification_zenvilla:"pricing",objectif_commercial:"objective",tarification:"pricing"};
const settingsKeys=["brand","website","email","phone","zone","objective","pricing"] as const;
const prospectKeys=new Set(['prenom','nom','civilite','nom_villa','zone','telephone','email','services','besoins','organisation_actuelle','date_rdv','heure_rdv','creneau_1','creneau_2','prestations_proposees']);
const forbidden=new Set(['__proto__','prototype','constructor']);
const own=(value:object,key:string)=>Object.prototype.hasOwnProperty.call(value,key);
/** The same plain-text renderer is used by preview, composer and backend tests. */
export function renderSalesTemplate(template:SalesTemplate,values:Record<string,unknown>,settings:SalesSettings):{subject:string;content:string;missing:string[]}{
 const allowed:Record<string,string>=Object.create(null);
 for(const key of settingsKeys)if(own(settings,key)){allowed[`settings.${key}`]=settings[key];allowed[`entreprise_${key}`]=settings[key];}
 for(const [key,target]of Object.entries(central))if(own(settings,target))allowed[key]=settings[target];
 const registered=own(values,'__salesVariableIds')&&Array.isArray(values.__salesVariableIds)?values.__salesVariableIds:[];
 const missing=new Set<string>();
 const render=(text:string)=>text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g,(token,key:string)=>{
   key=key.trim();let value:unknown;
   if(own(allowed,key))value=allowed[key];
   else if(!forbidden.has(key)&&/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)&&(prospectKeys.has(key)||registered.includes(key))&&own(values,key))value=values[key];
   if(typeof value!=="string"||!value.trim()){missing.add(key);return token;}return value;
 });
 return{subject:render(template.subject||""),content:render([template.content,...template.sections.map(s=>[s.title,s.content].filter(Boolean).join('\n'))].filter(Boolean).join('\n\n')),missing:[...missing]};
}
