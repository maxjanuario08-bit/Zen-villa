import {Check,ArrowRight} from "lucide-react";
import {localizedPageMetadata} from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import providers from "@/data/service-providers.json";
import ServiceProviders from "@/components/ServiceProviders";
import ServicePricing from "@/components/ServicePricing";
import Button from "@/components/ui/Button";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { voyageursServices } from "@/lib/voyageurs-services";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return voyageursServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = voyageursServices.find((s) => s.slug === slug);
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  if (!service)
    return { title: `${tCommon("serviceNotFound")} | ZenVilla` };

  const tGuest = await getTranslations({ locale, namespace: "guestServices" });
  return localizedPageMetadata({
    locale,
    path: `/voyageurs/${slug}`,
    title: tGuest(`${slug}.label`),
    description: tGuest(`${slug}.description`),
  });
}

export default async function VoyageurServicePage({ params }: Props) {
  const { locale, slug } = await params;
  const service = voyageursServices.find((s) => s.slug === slug);

  if (!service) notFound();

  const tGuest = await getTranslations({ locale, namespace: "guestServices" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const presentation = await getTranslations({locale,namespace:"GuestPresentation"});
  const hasExternalProvider=providers.some(provider=>provider.enabled && provider.services.includes(slug));
  const pricing=await getTranslations({locale,namespace:"Pricing"});
  const label = tGuest(`${slug}.label`);
  const description = presentation(`cards.${slug}`);
  const details = tGuest.raw(`${slug}.details`) as readonly string[];

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={service.image}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/voyageurs"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium mb-6"
          >
            ← {tCommon("backToServices")}
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
              <ServiceIcon name={service.icon} iconClassName="!text-white !w-14 !h-14" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-white">{label}</h1>
              <p className="mt-2 text-white/90 max-w-2xl">{description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className={`grid items-center gap-8 ${slug==="location-voiture-scooter"?"mx-auto max-w-3xl":"lg:grid-cols-2 lg:gap-12"}`}>
            {slug!=="location-voiture-scooter" ? <div><h2 className="mb-7 font-serif text-3xl font-semibold text-lagoon-dark">{slug==="balades-equestres"?pricing("horseTitle"):presentation("detailsTitle")}</h2><ul className={slug==="balades-equestres"?"grid gap-3 sm:grid-cols-2":"space-y-4"}>{details.map(item=><li key={item} className={`flex items-start gap-3 ${slug==="balades-equestres"?"rounded-2xl border border-sand/60 bg-white p-4":""}`}><span className="mt-1 rounded-full bg-lagoon p-1 text-white"><Check size={13} aria-hidden="true"/></span><span className="leading-relaxed text-foreground/90">{item}</span></li>)}</ul></div> : null}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src={service.image} alt={label} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover"/></div>
          </div>

          <ServiceProviders locale={locale} service={slug}/>
          <div className="mt-10"><ServicePricing locale={locale} audience="guest" service={slug} compact/></div>
          {!hasExternalProvider ? <div className="mt-10 rounded-2xl border border-sand/50 bg-white p-6 text-center sm:p-9"><h2 className="font-serif text-3xl font-semibold text-lagoon-dark">{presentation("requestTitle")}</h2><p className="mx-auto mb-6 mt-3 max-w-2xl text-muted">{presentation("requestBody")}</p><Button href={`/demander-prestation?prestation=${service.slug}`}><span>{presentation("requestButton")}</span><ArrowRight size={17} aria-hidden="true" className="ml-2"/></Button><div className="mt-5"><Link href="/voyageurs" className="text-sm font-semibold text-lagoon underline underline-offset-4">{tCommon("viewAllGuestServices")}</Link></div></div> : <div className="mt-8 text-center"><Link href="/voyageurs" className="text-sm font-semibold text-lagoon underline underline-offset-4">{tCommon("viewAllGuestServices")}</Link></div>}
        </div>
      </section>
    </div>
  );
}
