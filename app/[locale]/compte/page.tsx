import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLogement } from "@/lib/logements";
import { requireOwner } from "@/lib/owner-auth";
import { getStaysForSlug } from "@/lib/owner-data";
import { yearFinance } from "@/lib/owner-finances";
import type { BookingConfig } from "@/lib/booking";

type Props = { params: Promise<{ locale: string }> };

export default async function ComptePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireOwner();
  const t = await getTranslations({ locale, namespace: "Compte" });
  const tLog = await getTranslations({ locale, namespace: "Logements" });
  const year = new Date().getFullYear();
  const euro = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const cards = (
    await Promise.all(
      session.logements.map(async (slug) => {
        const logement = getLogement(slug);
        if (!logement?.booking) return null;
        const finance = yearFinance(await getStaysForSlug(slug), logement.booking as BookingConfig, year);
        return { slug, logement, finance };
      }),
    )
  ).filter((row): row is NonNullable<typeof row> => row != null);

  return (
    <section className="bg-sand-light py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold text-lagoon-dark sm:text-4xl">
          {t("dashHello", { name: session.name })}
        </h1>
        <p className="mt-3 max-w-2xl text-foreground/75">{t("dashLead")}</p>

        {cards.length === 0 ? (
          <p className="mt-10 text-sm text-muted">{t("dashEmpty")}</p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {cards.map(({ slug, logement, finance }) => {
              const name = tLog(`${logement.copyKey}.name`);
              return (
                <li key={slug}>
                  <Link
                    href={`/compte/${slug}`}
                    className="block overflow-hidden rounded-2xl border border-sand/40 bg-white shadow-card transition-shadow hover:shadow-lg"
                  >
                    <div className="relative h-44">
                      <Image
                        src={logement.image}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      <h2 className="font-serif text-2xl text-lagoon-dark">{name}</h2>
                      <p className="mt-1 text-sm text-muted">{tLog(`${logement.copyKey}.tagline`)}</p>
                      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-muted">{t("yearRevenue", { year })}</dt>
                          <dd className="font-medium text-lagoon-dark">{euro.format(finance.lodging)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">{t("yearFee", { year })}</dt>
                          <dd className="font-medium text-lagoon-dark">{euro.format(finance.fee)}</dd>
                        </div>
                      </dl>
                      <p className="mt-3 text-xs text-muted">
                        {t("nightsRented", { count: finance.nights })}
                      </p>
                      <p className="mt-4 text-sm font-medium text-lagoon">{t("seeLogement")} →</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
