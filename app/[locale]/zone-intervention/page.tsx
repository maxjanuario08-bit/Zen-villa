import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Button from "@/components/ui/Button";
import { localizedPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

const sectors = [
  { key: "core", id: "porto-vecchio", places: ["Porto-Vecchio", "Santa Giulia", "Bocca dell’Oro", "Piccovaggia", "Palombaggia", "Tamaricciu"] },
  { key: "north", id: "nord-du-golfe", places: ["Lecci", "Cala Rossa", "Saint-Cyprien", "Pinarello", "Sainte-Lucie-de-Porto-Vecchio"] },
  { key: "south", id: "sud-et-interieur", places: ["Bonifacio", "Sotta", "Figari", "Pianottoli-Caldarello"] },
] as const;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ServiceArea" });
  return localizedPageMetadata({
    locale, path: "/zone-intervention", title: t("metaTitle"),
    description: t("intro"), image: "/logements/pinson/terrasse.jpg",
  });
}

export default async function ServiceAreaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ServiceArea" });

  return (
    <div>
      <section id="santa-giulia" className="scroll-mt-24 bg-sand-light">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-semibold text-lagoon-dark">{t("eyebrow")}</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-lagoon-dark sm:text-5xl">{t("title")}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/80">{t("intro")}</p>
            <Button href="/contact#formulaire" className="mt-7">{t("cta")}</Button>
          </div>
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl sm:aspect-[16/10]">
              <Image src="/logements/pinson/terrasse.jpg" alt={t("photoAlt")} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-2 text-sm text-foreground/70">Mini Villa Pinson · Santa Giulia</figcaption>
          </figure>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <h2 className="font-serif text-3xl font-semibold text-lagoon-dark">{t("sectors")}</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {sectors.map(({ key, id, places }) => (
            <article key={key} id={id} className={`scroll-mt-28 rounded-3xl border border-sand/60 p-6 ${key === "core" ? "bg-lagoon-dark text-white" : "bg-sand-light text-lagoon-dark"}`}>
              <h3 className="font-serif text-2xl font-semibold">{t(`${key}Title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed">{t(`${key}Text`)}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {places.map(place => <li key={place} className="rounded-full border border-current/25 px-3 py-1 text-sm">{place}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-sand/60 p-6 sm:p-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("contactTitle")}</h2>
            <p className="mt-2 leading-relaxed text-foreground/80">{t("contactText")}</p>
          </div>
          <Button href="/contact#formulaire">{t("cta")}</Button>
        </div>
      </section>
    </div>
  );
}
