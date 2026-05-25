import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { homeServices } from "@/lib/services";

type Props = { params: Promise<{ locale: string }> };

type WhyPillar = { title: string; body: string };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const tSvc = await getTranslations("ownerServices");
  const tCommon = await getTranslations("Common");
  const pillars = (t.raw("whyPillars") as readonly WhyPillar[]) ?? [];

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-baie.png"
            alt={t("heroAlt")}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/40" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-white/95 max-w-3xl mx-auto leading-snug sm:leading-relaxed animate-fade-in-up animation-delay-100">
            {t("heroSubtitle")}
          </p>
          <p className="mt-8 font-sans text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/90 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            {t("heroPillars")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
            <Button href="/proprietaires" variant="primary" className="!bg-white !text-lagoon hover:!bg-sand-light">
              {t("ctaTrustVilla")}
            </Button>
            <Button href="/contact" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark">
              {tCommon("contactUs")}
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-8">
            {t("whyTitle")}
          </h2>
          <p className="mx-auto max-w-3xl text-center text-lg sm:text-xl text-foreground/90 leading-relaxed mb-14 sm:mb-16">
            {t("whyLead")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-white/20 bg-lagoon px-6 py-7 text-center text-white shadow-lg shadow-lagoon/25 md:text-left flex flex-col justify-start transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-lagoon/35"
              >
                <h3 className="font-sans font-bold text-lg leading-snug mb-4">{pillar.title}</h3>
                <p className="text-[0.9375rem] sm:text-base leading-relaxed text-white/90">{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            {t("servicesTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeServices.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <Card className="text-center h-full hover:border-lagoon/40 cursor-pointer transition-all">
                  <ServiceIcon name={service.icon} />
                  <h3 className="font-serif text-xl font-medium text-lagoon-dark">
                    {tSvc(`${service.slug}.label`)}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/70">{t("servicesHint")}</p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href="/proprietaires" variant="primary">
              {tCommon("seeOwnersOffer")}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-lagoon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white mb-6">
            {t("ownersCtaTitle")}
          </h2>
          <p className="text-white/90 text-lg mb-8">{t("ownersCtaBody")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact" variant="secondary" className="!bg-white !text-lagoon hover:!bg-sand-light">
              {tCommon("requestQuote")}
            </Button>
            <Button href="/packs" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark">
              {tCommon("seePacks")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
