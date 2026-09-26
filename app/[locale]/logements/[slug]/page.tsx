import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BookingWidget from "@/components/BookingWidget";
import PhotoCarousel from "@/components/PhotoCarousel";
import { getLogement, logements } from "@/lib/logements";
import type { BookingConfig } from "@/lib/booking";
import { getBookingWithAvailability } from "@/lib/owner-calendar";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ paid?: string; canceled?: string }>;
};

export function generateStaticParams() {
  return logements.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const logement = getLogement(slug);
  const t = await getTranslations({ locale, namespace: "Logements" });

  if (!logement) {
    return { title: t("notFound") };
  }

  return {
    title: `${t(`${logement.copyKey}.name`)} | ZenVilla`,
    description: t(`${logement.copyKey}.description`),
  };
}

export default async function LogementDetailPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const logement = getLogement(slug);
  if (!logement) notFound();

  const t = await getTranslations({ locale, namespace: "Logements" });
  const name = t(`${logement.copyKey}.name`);
  const tagline = t(`${logement.copyKey}.tagline`);
  const description = t(`${logement.copyKey}.description`);
  const address = t(`${logement.copyKey}.address`);
  const highlights = t.raw(`${logement.copyKey}.highlights`) as readonly string[];
  const amenityGroups = t.raw(`${logement.copyKey}.amenityGroups`) as
    | readonly { title: string; items: readonly string[] }[]
    | undefined;
  const photoAlts = (t.raw(`${logement.copyKey}.photoAlts`) as readonly string[] | undefined) ?? [];
  const gallery = logement.images?.length ? logement.images : [logement.image];
  const showBooking = Boolean(logement.forRent && logement.booking?.enabled);
  const booking =
    showBooking && logement.booking
      ? ((await getBookingWithAvailability(slug)) ?? (logement.booking as BookingConfig))
      : null;

  return (
    <div>
      <section className="relative min-h-[40vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={logement.image} alt={photoAlts[0] ?? name} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-lagoon-dark/40" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href={logement.forRent ? "/logements" : "/confiance"}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium mb-6"
          >
            ← {logement.forRent ? t("backToList") : t("backToBook")}
          </Link>
          <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg">{name}</h1>
          <p className="mt-4 text-lg text-white/95 max-w-2xl">{tagline}</p>
          <p className="mt-3 text-sm text-white/80">{address}</p>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-sand-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 gap-10 ${showBooking ? "lg:grid-cols-[1fr_24rem] lg:items-start" : ""}`}>
            <div>
              <p className="text-lg text-foreground/90 leading-relaxed">{description}</p>
              <p className="mt-4 text-sm text-muted">
                {t("guestsLabel", { count: logement.guests })}
                {" · "}
                {t("bedroomsLabel", { count: logement.bedrooms })}
                {logement.interiorM2 != null && logement.terraceM2 != null && (
                  <>
                    {" · "}
                    {t("surfaceLabel", {
                      interior: new Intl.NumberFormat(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(logement.interiorM2),
                      terrace: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(logement.terraceM2),
                    })}
                  </>
                )}
              </p>

              <div className="mt-10">
                <PhotoCarousel
                  images={gallery}
                  alts={photoAlts}
                  fallbackAlt={name}
                  prevLabel={t("photoPrev")}
                  nextLabel={t("photoNext")}
                />
              </div>

              <h2 className="mt-10 text-2xl font-serif font-semibold text-lagoon-dark">{t("includedTitle")}</h2>
              <ul className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-lagoon mt-0.5">✓</span>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>

              {amenityGroups && amenityGroups.length > 0 ? (
                  <div className="mt-10">
                    <h2 className="text-2xl font-serif font-semibold text-lagoon-dark">{t("amenitiesTitle")}</h2>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {amenityGroups.map((group) => (
                        <div key={group.title}>
                          <h3 className="font-medium text-lagoon-dark">{group.title}</h3>
                          <ul className="mt-2 space-y-1.5">
                            {group.items.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                                <span className="text-lagoon mt-0.5">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
              ) : null}
            </div>

            {showBooking && booking && (
              <div className="lg:sticky lg:top-24">
                <BookingWidget
                  slug={logement.slug}
                  name={name}
                  maxGuests={logement.guests}
                  booking={booking}
                  paymentNotice={query.paid === "1" ? "paid" : query.canceled === "1" ? "canceled" : null}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
