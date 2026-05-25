import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Button from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  return {
    title: t("pvMetaTitle"),
    description: t("pvMetaDesc"),
    openGraph: {
      title: t("pvOgTitle"),
      description: t("pvOgDesc"),
    },
  };
}

export default async function ConciergeriePortoVecchioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ConciergePV" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-eau.png"
            alt={t("heroImgAlt")}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto">{t("heroSubtitle")}</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact" variant="primary" className="!bg-white !text-lagoon hover:!bg-sand-light">
              {tCommon("contactUs")}
            </Button>
            <Button href="/packs" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark">
              {tCommon("discoverPacks")}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-lagoon-dark text-center mb-8">
            {t("bodyTitle")}
          </h2>
          <div className="prose prose-lg text-foreground/90 space-y-4">
            <p>{t("bodyLead")}</p>
            <p>{t("bodyNext")}</p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-lagoon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-white mb-6">{t("ctaTitle")}</h2>
          <Button href="/packs" variant="secondary" className="!bg-white !text-lagoon hover:!bg-sand-light">
            {tCommon("discoverZenVilla")}
          </Button>
        </div>
      </section>
    </div>
  );
}
