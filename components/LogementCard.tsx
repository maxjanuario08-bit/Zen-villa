import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Logement } from "@/lib/logements";
import { minNightly } from "@/lib/booking";

type Props = {
  logement: Logement;
  locale: string;
  variant?: "rent" | "book";
};

export default async function LogementCard({ logement, locale, variant = "rent" }: Props) {
  const t = await getTranslations({ locale, namespace: "Logements" });
  const name = t(`${logement.copyKey}.name`);
  const tagline = t(`${logement.copyKey}.tagline`);
  const fromPrice =
    logement.booking &&
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(minNightly(logement.booking));

  return (
    <Link href={`/logements/${logement.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-sand/30 bg-white shadow-card transition-all duration-300 hover:border-lagoon/30 hover:shadow-lg">
        <div className="relative h-48 sm:h-52 shrink-0">
          <Image
            src={logement.image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/15" />
          {variant === "book" && logement.managed && (
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-lagoon-dark/90 px-3 py-1 text-xs font-semibold text-white">
                {t("badgeManaged")}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-serif text-xl font-semibold text-lagoon-dark">{name}</h3>
          <p className="mt-1 text-sm text-foreground/75">{tagline}</p>
          <p className="mt-3 text-sm text-muted">
            {t("guestsLabel", { count: logement.guests })}
            {" · "}
            {t("bedroomsLabel", { count: logement.bedrooms })}
            {logement.interiorM2 != null && logement.terraceM2 != null && (
              <>
                {" · "}
                {t("surfaceLabel", {
                  interior: new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                    logement.interiorM2,
                  ),
                  terrace: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(logement.terraceM2),
                })}
              </>
            )}
          </p>
          {variant === "rent" && fromPrice && (
            <p className="mt-2 text-sm font-medium text-lagoon">{t("fromNight", { price: fromPrice })}</p>
          )}
          <p className="mt-4 text-sm font-medium text-lagoon">{t("seeProperty")} →</p>
        </div>
      </article>
    </Link>
  );
}
