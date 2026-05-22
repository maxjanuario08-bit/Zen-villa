import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { proprietairesAvantages } from "@/lib/proprietaires-avantages";

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
  const processSteps = tOwners.raw("processSteps") as readonly { titre: string; desc: string }[];

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
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            {tOwners("heroTitle")}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            {tOwners("heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {whyBullets.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-lagoon mt-0.5 font-bold text-lg">✓</span>
                <span className="text-foreground/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            {tOwners("processTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {processSteps.map((step, idx) => (
              <div key={`${step.titre}-${step.desc}`} className="text-center">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lagoon text-white font-serif font-semibold text-lg mb-4">
                  {idx + 1}
                </span>
                <h3 className="font-serif text-lg font-medium text-lagoon-dark mb-2">{step.titre}</h3>
                <p className="text-sm text-foreground/80">{step.desc}</p>
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
