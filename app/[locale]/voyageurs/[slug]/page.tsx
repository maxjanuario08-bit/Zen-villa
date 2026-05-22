import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
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
  return {
    title: `${tGuest(`${slug}.label`)} | ZenVilla`,
    description: tGuest(`${slug}.description`),
  };
}

export default async function VoyageurServicePage({ params }: Props) {
  const { locale, slug } = await params;
  const service = voyageursServices.find((s) => s.slug === slug);

  if (!service) notFound();

  const tGuest = await getTranslations({ locale, namespace: "guestServices" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const tFooter = await getTranslations({ locale, namespace: "Footer" });
  const label = tGuest(`${slug}.label`);
  const description = tGuest(`${slug}.description`);
  const details = tGuest.raw(`${slug}.details`) as readonly string[];

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-cote.png"
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

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-semibold text-lagoon-dark mb-8">{tCommon("inDetail")}</h2>
          <ul className="space-y-4">
            {details.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-lagoon mt-0.5 text-xl">✓</span>
                <span className="text-foreground/90 text-lg">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 pt-8 border-t border-sand/50">
            <p className="text-foreground/80 mb-6">{tCommon("bookingHintGuest")}</p>
            <div className="flex flex-wrap gap-4">
              <Button href="/demander-prestation" variant="primary">
                {tFooter("linkRequestService")}
              </Button>
              <Button href="/voyageurs" variant="outline">
                {tCommon("viewAllGuestServices")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
