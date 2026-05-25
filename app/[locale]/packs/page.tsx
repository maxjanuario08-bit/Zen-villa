import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default async function PacksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Packs" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const packs = [
    {
      key: "zenT" as const,
      featured: false,
      image: "/hero-eau.png",
    },
    {
      key: "zenP" as const,
      featured: true,
      image: "/hero-packs.png",
    },
    {
      key: "carte" as const,
      featured: false,
      image: "/hero-baie.png",
    },
  ];

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-packs.png"
            alt={t("heroAlt")}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/45" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            {t("heroSubtitle")}
          </p>
          <Button
            href="/contact"
            variant="primary"
            className="mt-10 !bg-white !text-lagoon hover:!bg-sand-light animate-fade-in-up animation-delay-200"
          >
            {tCommon("requestQuote")}
          </Button>
        </div>
      </section>

      <section className="py-12 sm:py-20 pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {packs.map((pack) => {
              const title = t(`${pack.key}Title`);
              const subtitle = t(`${pack.key}Subtitle`);
              const inclus = t.raw(`${pack.key}Essential`) as readonly string[];

              return (
                <Card
                  key={pack.key}
                  hover={false}
                  className={`relative flex flex-col overflow-hidden p-0 ${
                    pack.featured
                      ? "lg:-mt-4 lg:mb-4 border-2 border-lagoon shadow-lg ring-2 ring-lagoon/20"
                      : ""
                  }`}
                >
                  {pack.featured && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="rounded-full bg-lagoon px-4 py-1 text-xs font-medium text-white">
                        {t("badgePopular")}
                      </span>
                    </div>
                  )}
                  <div className="h-40 sm:h-44 shrink-0 relative">
                    <Image
                      src={pack.image}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 34vw"
                    />
                    <div className="absolute inset-0 bg-lagoon-dark/20" />
                  </div>
                  <div className="flex flex-col flex-1 p-6 sm:p-8">
                    <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{title}</h2>
                    <p className="text-sm text-lagoon/80 mt-1">{subtitle}</p>
                    <div className="mt-6 flex-1 space-y-2">
                      {inclus.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <span className="text-lagoon mt-0.5">✓</span>
                          <span className="text-foreground/90 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-sand/50 px-6 sm:px-8 pb-6">
                    <Button
                      href="/contact"
                      variant={pack.featured ? "primary" : "outline"}
                      className="w-full mt-4 !rounded-full justify-center"
                    >
                      {tCommon("requestQuote")}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
