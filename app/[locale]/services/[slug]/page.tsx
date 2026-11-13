import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Camera, Check, CircleCheck, ClipboardCheck, Headset, House, ImageIcon, Info, KeyRound, Leaf, MapPin, MessageCircle, Monitor, Send, Shirt, Sparkles, Wrench } from "lucide-react";
import Button from "@/components/ui/Button";
import { homeServices, type HomeServiceSlug } from "@/lib/services";
import { localizedPageMetadata } from "@/lib/seo";

interface Props { params: Promise<{ locale: string; slug: string }> }
const serviceIcons = {
  "check-in": {hero:KeyRound, items:[KeyRound,House,ClipboardCheck,MessageCircle]},
  menage:{hero:Sparkles,items:[House,Shirt,Leaf,CircleCheck]},
  reservations:{hero:CalendarDays,items:[CalendarDays,ClipboardCheck,MessageCircle,Monitor]},
  maintenance:{hero:Wrench,items:[CalendarDays,Wrench,House,ClipboardCheck]},
  activites:{hero:Leaf,items:[MapPin,House,KeyRound,MessageCircle]},
  assistance:{hero:Headset,items:[CalendarDays,Headset,Wrench,Monitor]},
  "annonces-photos":{hero:Camera,items:[ClipboardCheck,House,ImageIcon,Monitor]},
} satisfies Record<HomeServiceSlug,unknown>;

export async function generateStaticParams() { return homeServices.map(s => ({slug:s.slug})); }
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {locale,slug}=await params;
  if(!homeServices.some(s=>s.slug===slug)) return {};
  const t=await getTranslations({locale,namespace:"ownerServices"});
  return localizedPageMetadata({
    locale,
    path: `/services/${slug}`,
    title: t(`${slug}.label`),
    description: t(`${slug}.description`),
  });
}
export default async function ServiceDetailPage({params}:Props) {
  const {locale,slug}=await params;
  const service=homeServices.find(s=>s.slug===slug);
  if(!service) notFound();
  const [t,presentation]=await Promise.all([
    getTranslations({locale,namespace:"ownerServices"}),
    getTranslations({locale,namespace:"ServicePresentation"}),
  ]);
  const label=t(`${slug}.label`);
  const details=t.raw(`${slug}.details`) as readonly string[];
  const benefits=presentation.raw(`benefits.${slug}`) as readonly string[];
  const {hero:HeroIcon,items}=serviceIcons[service.slug];
  const pricing = await getTranslations({ locale, namespace: "Pricing" });
  return <div>
    <section className="relative isolate overflow-hidden bg-lagoon-dark text-white">
      <Image src="/hero-eau.png" alt="" fill priority sizes="100vw" className="-z-20 object-cover"/>
      <div className="absolute inset-0 -z-10 bg-lagoon-dark/45"/>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link href="/#services" className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-white/95 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><ArrowLeft size={17} aria-hidden="true"/>{presentation("back")}</Link>
        <div className="mt-8 flex flex-col gap-5 pb-4 sm:flex-row sm:items-center sm:gap-7 sm:pb-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/25 backdrop-blur-sm sm:h-24 sm:w-24"><HeroIcon size={46} strokeWidth={1.5} aria-hidden="true"/></div>
          <div><h1 className="hero-title text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{label}</h1><p className="mt-4 max-w-3xl text-base leading-relaxed text-white/95 sm:text-lg">{t(`${slug}.description`)}</p></div>
        </div>
      </div>
    </section>
    <section className="bg-sand-light/60 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)] lg:gap-10 lg:px-8">
        <div><h2 className="font-serif text-2xl font-semibold text-lagoon-dark sm:text-3xl">{presentation("heading")}</h2>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2">{details.map((item,index)=>{const Icon=items[index] ?? CircleCheck;return <li key={item} className="flex min-h-28 items-center gap-5 rounded-2xl border border-sand/40 bg-white p-5 shadow-card"><Icon size={36} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-lagoon"/><span className="text-base font-medium leading-relaxed text-lagoon-dark">{item}</span></li>;})}</ul>
          <div className="mt-8 flex items-start gap-4 border-t border-sand/70 pt-6"><Info size={25} aria-hidden="true" className="mt-0.5 shrink-0 text-lagoon"/><p className="text-sm leading-relaxed text-foreground/80">{presentation("note")}</p></div>
          <Button href="/contact#formulaire" className="mt-7 w-full gap-3 py-4 sm:w-auto sm:min-w-80"><Send size={20} aria-hidden="true"/>{presentation("cta")}</Button>
        </div>
        <aside aria-labelledby="service-benefits-title" className="rounded-3xl bg-lagoon/10 p-6 sm:p-8 lg:mt-12">
          <div className="flex items-start justify-between gap-4"><h2 id="service-benefits-title" className="font-serif text-2xl font-semibold leading-tight text-lagoon-dark">{presentation("benefitsTitle")}</h2><HeroIcon size={40} strokeWidth={1.4} aria-hidden="true" className="shrink-0 text-lagoon"/></div>
          <div className="mt-5 h-0.5 w-6 bg-lagoon"/>
          <ul className="mt-6 space-y-4">{benefits.map(item=><li key={item} className="flex items-start gap-3 text-sm font-medium leading-relaxed text-lagoon-dark"><Check size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-lagoon"/>{item}</li>)}</ul>
        </aside>
      </div>
    </section>
    <section className="bg-background px-4 py-10 text-center">
      <Button href="/formules#tarifs-a-la-carte" variant="outline">{pricing("allPrices")}</Button>
    </section>
  </div>;
}
