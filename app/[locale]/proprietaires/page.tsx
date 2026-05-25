import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { proprietairesAvantages } from "@/lib/proprietaires-avantages";
import { SITE } from "@/lib/constants";

type OwnersFlyerPhase = { readonly line1: string; readonly line2: string };

export default async function ProprietairesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const tOwners = await getTranslations({ locale, namespace: "Owners" });
  const tBenefits = await getTranslations({ locale, namespace: "ownerBenefits" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const tHome = await getTranslations({ locale, namespace: "Home" });
  const tPacks = await getTranslations({ locale, namespace: "Packs" });

  const whyBullets = tOwners.raw("whyBullets") as readonly string[];
  const flyerPhases = tOwners.raw("flyerPhases") as readonly OwnersFlyerPhase[];

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-eau.png"
            alt={tOwners("heroAlt")}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <div className="animate-fade-in-up mb-6 space-y-1">
            <p className="flyer-kicker text-white">{tOwners("flyerKickerTop")}</p>
            <p className="flyer-kicker text-white">{tOwners("flyerKickerBot")}</p>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-serif font-semibold text-white drop-shadow-lg whitespace-pre-line leading-tight animate-fade-in-up animation-delay-100">
            {tOwners("heroTitle")}
          </h1>

          <p className="mt-8 text-base sm:text-lg text-white/95 max-w-xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            {tOwners("heroSubtitle")}
          </p>

          <p className="mt-10 font-sans text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/90 animate-fade-in-up animation-delay-200">
            {tOwners("flyerPillars")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
            <Button href="/packs" variant="primary" className="!bg-white !text-lagoon hover:!bg-sand-light">
              {tHome("ctaTrustVilla")}
            </Button>
            <Button
              href="/contact"
              variant="outline"
              className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark"
            >
              {tCommon("contactUs")}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            {tOwners("whySectionTitle")}
          </h2>
          <div className="mx-auto max-w-3xl flex flex-col gap-3 sm:gap-4">
            {whyBullets.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-sand-dark/25 bg-sand-light/35 px-4 py-3.5 text-left shadow-sm sm:px-5"
              >
                <p className="text-foreground/95 text-[0.9375rem] sm:text-base leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-sans text-xs font-semibold uppercase tracking-[0.25em] text-lagoon mb-3">
            {SITE.name}
          </h2>
          <h3 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            {tOwners("processTitle")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {flyerPhases.map((phase) => (
              <div key={`${phase.line1}-${phase.line2}`} className="flyer-phase-ring px-4 py-6 rounded-sm shadow-sm">
                <p className="flyer-phase-line1">{phase.line1}</p>
                <p className="flyer-phase-line2">{phase.line2}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            {tOwners("advantagesSectionTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proprietairesAvantages.map((item) => (
              <Link key={item.slug} href={`/proprietaires/${item.slug}`}>
                <Card className="h-full hover:border-lagoon/40 cursor-pointer transition-all">
                  <ServiceIcon name={item.icon} />
                  <h3 className="font-serif text-xl font-medium text-lagoon-dark mb-2">
                    {tBenefits(`${item.slug}.titre`)}
                  </h3>
                  <p className="text-foreground/80 leading-relaxed">{tBenefits(`${item.slug}.description`)}</p>
                  <p className="mt-3 text-sm text-lagoon font-medium">{tCommon("learnMoreArrow")}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-lagoon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white mb-6">{tOwners("ctaTitle")}</h2>
          <p className="text-white/90 text-lg mb-8">{tOwners("ctaSubtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/contact"
              variant="secondary"
              className="!bg-white !text-lagoon hover:!bg-sand-light"
            >
              {tCommon("requestQuote")}
            </Button>
            <Button
              href="/packs"
              variant="outline"
              className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark"
            >
              {tPacks("heroTitle")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
