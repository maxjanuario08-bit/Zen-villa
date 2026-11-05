import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {CalendarDays, BedDouble, Laptop, Camera, Image as ImageIcon, CalendarCheck, Headset, Wrench, Check, Minus, Star, ArrowRight} from "lucide-react";
import ServicePricing from "@/components/ServicePricing";
import {ownerPlanRates} from "@/lib/service-pricing";
import Button from "@/components/ui/Button";

const plans=[
 {key:"zenT",image:"/hero-eau.png",featured:false},
 {key:"zenP",image:"/hero-packs.png",featured:true},
 {key:"carte",image:"/hero-baie.png",featured:false},
] as const;
const features=[
 {icon:CalendarDays,tranquillite:true},
 {icon:BedDouble,tranquillite:true},
 {icon:Laptop,tranquillite:true},
 {icon:Camera,tranquillite:false},
 {icon:ImageIcon,tranquillite:false},
 {icon:CalendarCheck,tranquillite:false},
 {icon:Headset,tranquillite:true},
 {icon:Wrench,tranquillite:true},
];
export default async function FormulesPage({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;
 const pricing=await getTranslations({locale,namespace:"Pricing"});
 const t=await getTranslations({locale,namespace:"Packs"});
 const common=await getTranslations({locale,namespace:"Common"});
 const comparison=await getTranslations({locale,namespace:"FormulaComparison"});
 const descriptions=comparison.raw("descriptions") as string[];
 const rows=comparison.raw("rows") as string[];
 return <div>
  <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
   <div className="absolute inset-0"><Image src="/hero-packs.png" alt={t("heroAlt")} fill priority sizes="100vw" className="object-cover"/><div className="absolute inset-0 bg-lagoon-dark/45"/></div>
   <div className="relative mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90">{comparison("kicker")}</p><h1 className="mt-4 font-serif text-4xl font-semibold text-white sm:text-5xl">{t("heroTitle")}</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/95 sm:text-xl">{comparison("subtitle")}</p></div>
  </section>
  <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
   <div className="mx-auto max-w-7xl">
    <p className="mb-3 text-xs text-muted">{pricing("finalVat")}</p>
    <p id="comparison-scroll-hint" className="mb-4 text-sm text-muted lg:hidden">{comparison("scroll")}</p>
    <div role="region" aria-label={comparison("caption")} aria-describedby="comparison-scroll-hint" tabIndex={0} className="overflow-x-auto rounded-2xl border border-sand/70 bg-white p-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lagoon sm:p-5">
     <table className="relative w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-sm">
      <caption className="sr-only left-0 top-0">{comparison("caption")}</caption>
      <colgroup><col className="w-[34%]"/><col className="w-[22%]"/><col className="w-[22%]"/><col className="w-[22%]"/></colgroup>
      <thead><tr>
       <td className="sticky left-0 z-10 bg-white p-4 align-middle"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-lagoon">{comparison("eyebrow")}</p><h2 className="mt-3 font-serif text-3xl font-semibold text-lagoon-dark">{comparison("title")}</h2><p className="mt-4 max-w-xs leading-relaxed text-muted">{comparison("intro")}</p></td>
       {plans.map((plan,i)=><th key={plan.key} scope="col" className={`px-3 pb-5 pt-3 text-center align-top ${plan.featured?"rounded-t-2xl border-x border-t border-lagoon bg-lagoon/5":""}`}><div className="mb-3 flex h-8 items-center justify-center">{plan.featured?<span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon px-3 py-1 text-xs font-medium text-white"><Star size={13} aria-hidden="true"/>{comparison("recommended")}</span>:null}</div><div className="relative mb-4 h-24 overflow-hidden rounded-xl xl:h-32"><Image src={plan.image} alt="" fill sizes="(min-width: 1024px) 24vw, 200px" className="object-cover"/></div><p className="font-serif text-2xl font-semibold text-lagoon-dark xl:text-3xl">{t(`${plan.key}Title`)}</p><div className="mt-3"><p className="font-serif text-3xl font-semibold text-lagoon-dark">{plan.key === "carte" ? pricing("perIntervention") : `${ownerPlanRates[plan.key]} %`}</p>{plan.key !== "carte" ? <p className="mx-auto mt-2 max-w-52 text-xs font-normal leading-relaxed text-muted">{pricing("planBasis")}</p> : <a href="#tarifs-a-la-carte" className="mt-2 inline-block text-xs font-medium text-lagoon underline underline-offset-4">{pricing("allPrices")}</a>}</div><p className="mx-auto mt-2 w-fit rounded-full bg-lagoon/10 px-3 py-1 text-xs font-medium text-lagoon-dark">{descriptions[i]}</p></th>)}
      </tr></thead>
      <tbody>{features.map(({icon:Icon,tranquillite},i)=><tr key={rows[i]}>
       <th scope="row" className={`sticky left-0 z-10 border-t border-sand/60 px-4 py-4 text-left font-medium ${i%2===0?"bg-sand-light":"bg-white"}`}><span className="flex items-center gap-3"><Icon size={23} strokeWidth={1.6} aria-hidden="true" className="shrink-0 text-lagoon"/>{rows[i]}</span></th>
       <td className={`border-t border-sand/60 p-3 text-center ${i%2===0?"bg-sand-light/60":""}`}>{tranquillite?<Check size={27} strokeWidth={3} aria-hidden="true" className="mx-auto text-lagoon"/>:<Minus size={22} aria-hidden="true" className="mx-auto text-muted"/>}<span className="sr-only left-0 top-0">{comparison(tranquillite?"yes":"no")}</span></td>
       <td className={`border-x border-t border-x-lagoon border-t-sand/60 bg-lagoon/10 p-3 text-center ${i===features.length-1?"rounded-b-2xl border-b border-b-lagoon":""}`}><Check size={27} strokeWidth={3} aria-hidden="true" className="mx-auto text-lagoon"/><span className="sr-only left-0 top-0">{comparison("yes")}</span></td>
       <td className={`border-t border-sand/60 p-3 text-center text-foreground/80 ${i%2===0?"bg-sand-light/60":""}`}>{comparison("onRequest")}</td>
      </tr>)}</tbody>
     </table>
    </div>
    <div className="mt-12"><ServicePricing locale={locale} audience="owner"/></div>
    <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row"><Button href="/contact"><span>{common("requestQuote")}</span><ArrowRight size={17} aria-hidden="true" className="ml-2"/></Button><Button href="/contact#rendez-vous" variant="outline"><CalendarDays size={18} aria-hidden="true" className="mr-2"/>{comparison("appointment")}</Button></div>
   </div>
  </section>
 </div>;
}
