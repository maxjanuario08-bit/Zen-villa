import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {CalendarDays, ShieldCheck, Laptop, Sparkles, KeyRound, BrushCleaning, Wrench, Camera, Headset, Leaf, MessageCircle, House, FileText, CircleCheck, Check, ArrowRight} from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/JsonLd";
import { CONTACT, SITE } from "@/lib/constants";
import { languageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const {locale}=await params;return {alternates:languageAlternates(locale,"/")};
}
const benefitIcons=[CalendarDays,ShieldCheck,Laptop,Sparkles];
const stepIcons=[MessageCircle,House,FileText,CircleCheck];
const services=[
 {icon:CalendarDays,href:"/services/reservations"},
 {icon:KeyRound,href:"/services/check-in"},
 {icon:BrushCleaning,href:"/services/menage"},
 {icon:Wrench,href:"/services/maintenance"},
 {icon:Camera,href:"/services/annonces-photos"},
 {icon:Leaf,href:"/services/activites"},
 {icon:Headset,href:"/services/assistance"},
];
export default async function HomePage({params}:Props){
 const {locale}=await params;setRequestLocale(locale);
 const t=await getTranslations("Home");const presentation=await getTranslations("HomePresentation");
 const benefits=presentation.raw("benefits") as [string,string][];
 const steps=presentation.raw("steps") as [string,string][];
 const labels=presentation.raw("services") as string[];
 const points=presentation.raw("examplePoints") as string[];
 return <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: SITE.name,
          url: SITE.url,
          image: SITE.ogImage,
          telephone: CONTACT.telephoneTel,
          email: CONTACT.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Résidence Bella Vista",
            postalCode: "20137",
            addressLocality: "Porto-Vecchio",
            addressRegion: "Corse",
            addressCountry: "FR",
          },
          areaServed: ["Santa Giulia", "Porto-Vecchio"],
        }}
      />

 <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
  <Image src="/hero-baie.png" alt={t("heroAlt")} fill priority sizes="100vw" className="object-cover"/>
  <div className="absolute inset-0 bg-lagoon-dark/40"/>
  <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
   <p className="mb-5 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-white sm:text-sm"><span className="hidden h-px w-16 bg-white/70 sm:block"/>{presentation("kicker")}<span className="hidden h-px w-16 bg-white/70 sm:block"/></p>
   <h1 className="mx-auto max-w-4xl text-balance font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">{t("heroTitle")}</h1>
   <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/95 sm:text-xl">{t("heroSubtitle")}</p>
   <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-5">
    <Button href="/contact#rendez-vous" className="!bg-white !text-lagoon hover:!bg-sand-light"><CalendarDays size={19} className="mr-2" aria-hidden="true"/>{presentation("appointment")}</Button>
    <Button href="/formules" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark">{presentation("discover")}</Button>
   </div>
  </div>
 </section>
 <section aria-label={presentation("kicker")} className="border-b border-sand/40 bg-white">
  <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-7 sm:grid-cols-2 xl:grid-cols-4">{benefits.map(([title,body],i)=>{const Icon=benefitIcons[i];return <div key={title} className="flex items-start gap-4 xl:border-r xl:border-sand last:xl:border-r-0"><Icon size={34} strokeWidth={1.5} aria-hidden="true" className="mt-1 shrink-0 text-lagoon"/><div className="pr-3"><h2 className="font-semibold text-lagoon-dark">{title}</h2><p className="mt-1 text-sm leading-relaxed text-muted">{body}</p></div></div>;})}</div>
 </section>
 <section id="services" className="scroll-mt-24 bg-sand-light/60 py-12 sm:py-16">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
   <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-lagoon">{presentation("servicesKicker")}</p>
   <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-lagoon-dark sm:text-4xl">{presentation("servicesTitle")}</h2>
   <p className="mx-auto mt-4 max-w-3xl text-center text-muted">{presentation("servicesIntro")}</p>
   <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">{services.map(({icon:Icon,href},i)=><Link key={href} href={href} className="group flex min-h-40 flex-col items-center justify-center rounded-2xl border border-sand/40 bg-white p-4 text-center transition-colors hover:border-lagoon hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lagoon"><Icon size={36} strokeWidth={1.5} aria-hidden="true" className="mb-4 text-lagoon"/><h3 className="text-sm font-semibold leading-snug text-lagoon-dark">{labels[i]}</h3></Link>)}</div>
   <div className="mt-7 flex justify-center"><Button href="/formules" variant="outline">{presentation("allServices")}<ArrowRight size={16} className="ml-2" aria-hidden="true"/></Button></div>
  </div>
 </section>
 <section className="bg-white py-12 sm:py-16">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
   <div className="grid gap-8 lg:grid-cols-[1fr_3fr] lg:items-start"><div className="lg:border-r lg:border-sand lg:pr-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-lagoon">{presentation("processKicker")}</p><h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-lagoon-dark">{presentation("processTitle")}</h2></div>
    <ol className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{steps.map(([title,body],i)=>{const Icon=stepIcons[i];return <li key={title}><div className="mb-3 flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-lagoon text-sm font-semibold text-white">{i+1}</span><Icon size={25} strokeWidth={1.5} aria-hidden="true" className="text-lagoon"/></div><h3 className="font-semibold text-lagoon-dark">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{body}</p></li>;})}</ol>
   </div>
   <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-14">
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10]"><Image src="/logements/pinson/terrasse.jpg" alt={presentation("exampleAlt")} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover"/><span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-lagoon-dark"><House size={17} aria-hidden="true"/>Santa Giulia · Bella Vista</span></div>
    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-lagoon">{presentation("exampleKicker")}</p><h2 className="mt-3 font-serif text-3xl font-semibold text-lagoon-dark sm:text-4xl">{presentation("exampleTitle")}</h2><p className="mt-4 max-w-xl leading-relaxed text-muted">{presentation("exampleBody")}</p><ul className="mt-6 space-y-3">{points.map(point=><li key={point} className="flex items-start gap-3 text-sm font-medium text-lagoon-dark"><span className="mt-0.5 rounded-full bg-lagoon p-1 text-white"><Check size={12} aria-hidden="true"/></span>{point}</li>)}</ul></div>
   </div>
  </div>
 </section>
    </div>;
}
