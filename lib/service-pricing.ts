import catalog from "@/data/service-pricing.json";
export type PricingAudience = "owner" | "guest";
export type PricingRow = {id:string;label:Record<string,string>;amount:number|null;mode:string;unit:string;extra:string;threeDays?:number};
export type PricingGroup = {id:string;audience:PricingAudience;services:string[];title:Record<string,string>;rows:PricingRow[];note:string|null};
export const servicePricing = catalog as PricingGroup[];
/** Public prices confirmed as final amounts including applicable taxes by Maxime. */
export const pricingTaxMode: "pending" | "final" | "franchise" = "final";
export const ownerPlanRates = {zenT:18,zenP:22} as const;
export function pricingGroups(audience:PricingAudience,service?:string) {
  return servicePricing.filter(group=>group.audience===audience && (!service || group.services.includes(service)));
}
export function priceText(row:PricingRow,locale:string,labels:Record<string,string>) {
  if(row.mode==="quote" || row.amount===null)return labels.quote;
  const amount=new Intl.NumberFormat(locale,{style:"currency",currency:"EUR",minimumFractionDigits:0,maximumFractionDigits:2}).format(row.amount);
  return `${row.mode==="from"?`${labels.from} `:row.mode==="supplement"?"+":""}${amount}${row.unit?` / ${labels[row.unit]}`:""}${row.extra?` + ${labels[row.extra]}`:""}`;
}
