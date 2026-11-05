import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {CalendarDays,MapPin,Sparkles,ArrowRight} from "lucide-react";
import {Link} from "@/i18n/navigation";
import ServicePricing from "@/components/ServicePricing";
import Button from "@/components/ui/Button";
import ServiceIcon from "@/components/icons/ServiceIcon";
import {voyageursServices} from "@/lib/voyageurs-services";
const benefitIcons=[CalendarDays,MapPin,Sparkles];
export default async function VoyageursPage({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;
 const t=await getTranslations({locale,namespace:"GuestsIndex"});
 const serviceT=await getTranslations({locale,namespace:"guestServices"});
 const presentation=await getTranslations({locale,namespace:"GuestPresentation"});
 const footer=await getTranslations({locale,namespace:"Footer"});
 const benefits=presentation.raw("benefits") as {title:string;body:string}[];
 return <div>
  <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
   <div className="absolute inset-0"><Image src="/hero-cote.png" alt={t("heroAlt")} fill priority sizes="100vw" className="object-cover"/><div className="absolute inset-0 bg-lagoon-dark/45"/></div>
   <div className="relative mx-auto max-w-5xl px-4 py-12 text-center sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">{presentation("kicker")}</p><h1 className="mt-4 text-balance font-serif text-4xl font-semibold text-white sm:text-5xl">{t("heroTitle")}</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/95 sm:text-xl">{presentation("subtitle")}</p></div>
  </section>
  <section className="border-b border-sand/50 bg-white"><div className="mx-auto grid max-w-7xl gap-6 px-6 py-7 md:grid-cols-3">{benefits.map((benefit,i)=>{const Icon=benefitIcons[i];return <div key={benefit.title} className="flex items-start gap-4 md:border-r md:border-sand last:md:border-r-0"><Icon size={32} aria-hidden="true" strokeWidth={1.5} className="shrink-0 text-lagoon"/><div><h2 className="font-semibold text-lagoon-dark">{benefit.title}</h2><p className="mt-1 pr-4 text-sm leading-relaxed text-muted">{benefit.body}</p></div></div>;})}</div></section>
  <section className="bg-sand-light/60 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><h2 className="sr-only">{t("servicesHeading")}</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
   {voyageursServices.map(service=><Link key={service.slug} href={`/voyageurs/${service.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sand/50 bg-white transition-colors hover:border-lagoon/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lagoon"><div className="relative h-48 shrink-0 overflow-hidden sm:h-52"><Image src={service.image} alt={serviceT(`${service.slug}.label`)} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-105"/></div><div className="relative flex flex-1 flex-col px-5 pb-6 pt-8"><span className="absolute -top-6 left-5 flex h-12 w-12 items-center justify-center rounded-xl border border-sand/60 bg-white"><ServiceIcon name={service.icon} className="!mb-0" iconClassName="!h-7 !w-7 !text-lagoon"/></span><h3 className="font-serif text-2xl font-semibold leading-tight text-lagoon-dark">{serviceT(`${service.slug}.label`)}</h3><p className="mb-5 mt-3 text-sm leading-relaxed text-muted">{presentation(`cards.${service.slug}`)}</p><span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-lagoon">{t("hint")}<ArrowRight size={16} aria-hidden="true"/></span></div></Link>)}
   </div></div></section>
  <section className="bg-background py-12 sm:py-16"><div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><ServicePricing locale={locale} audience="guest"/></div></section>
  <section className="bg-lagoon py-12 sm:py-16"><div className="mx-auto max-w-3xl px-4 text-center sm:px-6"><h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">{t("ctaTitle")}</h2><p className="mb-7 mt-4 text-white/90">{t("ctaBody")}</p><Button href="/demander-prestation" className="!bg-white !text-lagoon hover:!bg-sand-light">{footer("linkRequestService")}<ArrowRight size={16} className="ml-2" aria-hidden="true"/></Button></div></section>
 </div>;
}
