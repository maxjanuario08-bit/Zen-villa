import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/constants";
import {
  VILLA_PINSON,
  livretActivities,
  livretAmenityKeys,
  livretPlaces,
} from "@/lib/livret-villa-pinson";

type Props = { params: Promise<{ locale: string }> };

export default async function LivretVillaPinsonPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "livretVillaPinson" });

  return (
    <article className="bg-sand-light py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-lagoon">
          {t("coverSubtitle")}
        </p>
        <h1 className="mt-3 text-center font-serif text-3xl font-semibold text-lagoon-dark sm:text-4xl">
          {t("coverTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-foreground/75">
          {t("addressLabel")} · {t("address")}
        </p>

        <section className="mt-10 rounded-2xl border border-sand/40 bg-white p-6 shadow-card">
          <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("infoTitle")}</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">{t("arrivalLabel")}</dt>
              <dd className="font-medium">{t("arrivalTime")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">{t("departureLabel")}</dt>
              <dd className="font-medium">{t("departureTime")}</dd>
            </div>
          </dl>
          <h3 className="mt-6 font-medium text-lagoon-dark">{t("amenitiesTitle")}</h3>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
            {livretAmenityKeys.map((key) => (
              <li key={key}>· {t(`amenities.${key}`)}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-sand/40 bg-white p-6 shadow-card">
          <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("santaTitle")}</h2>
          <p className="mt-2 text-sm text-foreground/75">{t("santaLead")}</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            {(t.raw("santaTips") as string[]).map((tip) => (
              <li key={tip}>· {tip}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-sand/40 bg-white p-6 shadow-card">
          <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("visitTitle")}</h2>
          <p className="mt-2 text-sm text-foreground/75">{t("visitLead")}</p>
          <ul className="mt-4 space-y-3">
            {livretPlaces.map((place) => (
              <li key={place.key}>
                <p className="font-medium text-lagoon-dark">
                  {t(`places.${place.key}.name`)} · {t(`places.${place.key}.time`)}
                </p>
                <p className="text-sm text-foreground/75">{t(`places.${place.key}.desc`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-sand/40 bg-white p-6 shadow-card">
          <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("doTitle")}</h2>
          <p className="mt-2 text-sm text-foreground/75">{t("doLead")}</p>
          <ul className="mt-4 space-y-3">
            {livretActivities.map((item) => (
              <li key={item.key}>
                <p className="font-medium text-lagoon-dark">{t(`activities.${item.key}.title`)}</p>
                <p className="text-sm text-foreground/75">{t(`activities.${item.key}.desc`)}</p>
                <Link href={item.href} className="mt-1 inline-block text-sm font-medium text-lagoon">
                  {t("bookActivity")}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-lagoon bg-white p-6 shadow-card">
          <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("navContact")}</h2>
          <p className="mt-3 text-sm">
            {t("conciergerieLabel")} · {CONTACT.telephone}
          </p>
          <p className="mt-1 text-sm">
            <a className="font-medium text-lagoon" href={`tel:${CONTACT.telephoneTel}`}>
              {CONTACT.telephone}
            </a>
            {" · "}
            <a className="font-medium text-lagoon" href={CONTACT.whatsapp}>
              WhatsApp
            </a>
            {" · "}
            <a className="font-medium text-lagoon" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </p>
          <h3 className="mt-5 font-medium text-lagoon-dark">{t("practicalTitle")}</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {(t.raw("practical") as string[]).map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">{t("managedBy")}</p>
          <p className="mt-1 text-xs text-muted">{VILLA_PINSON.slug}</p>
        </section>
      </div>
    </article>
  );
}
