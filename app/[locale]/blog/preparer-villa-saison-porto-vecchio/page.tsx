import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/constants";

const path = "/blog/preparer-villa-saison-porto-vecchio";
const title = "Préparer sa villa pour la saison à Porto-Vecchio";
const description = "La checklist des propriétaires pour préparer une location saisonnière à Porto-Vecchio, de la remise en service du logement à l’arrivée des premiers voyageurs.";
const image = "/logements/pinson/terrasse.jpg";
const photoAlt = "Terrasse supérieure de la Mini Villa Pinson à Santa Giulia";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE.url}${path}` },
  openGraph: {
    type: "article",
    url: `${SITE.url}${path}`,
    title,
    description,
    images: [{ url: image, alt: photoAlt }],
  },
};

const steps = [
  {
    title: "Avant d’ouvrir le calendrier",
    items: [
      "Bloquez vos dates personnelles et les jours où des travaux sont prévus. Si vous louez sur plusieurs plateformes, vérifiez que leurs calendriers sont synchronisés.",
      "Vérifiez que l’annonce correspond au logement tel qu’il sera à l’arrivée. Relisez la capacité, les équipements, les indications de stationnement et les horaires.",
      "Désignez la personne qui pourra intervenir sur place et organisez les remises de clés et les rotations de ménage.",
    ],
  },
  {
    title: "Avant le premier séjour",
    items: [
      "Testez la climatisation, l’eau chaude et les appareils que les voyageurs utiliseront. Vérifiez aussi les serrures et l’éclairage extérieur.",
      "Préparez le linge et les consommables. Si deux séjours s’enchaînent, prévoyez un jeu de linge propre de rechange.",
      "Remettez la terrasse en état après l’hiver. Vérifiez les assises, les coussins et le mobilier avant de le remettre en service.",
    ],
  },
  {
    title: "La veille de l’arrivée",
    items: [
      "Envoyez l’itinéraire jusqu’au logement, le point de rendez-vous et les indications de stationnement. À Santa Giulia, précisez l’entrée de la résidence et les derniers repères à suivre.",
      "Confirmez l’heure d’arrivée et indiquez qui contacter si le trajet prend du retard.",
      "Faites un dernier tour du logement après le ménage. Vérifiez les couchages, la salle de bains, la cuisine et la remise des clés.",
    ],
  },
  {
    title: "Après le premier départ",
    items: [
      "Notez ce qu’il faut réapprovisionner ou réparer et attribuez chaque action avant l’arrivée suivante.",
      "Si les voyageurs ont posé plusieurs fois la même question, complétez le livret d’accueil avec la réponse.",
    ],
  },
];

export default async function SeasonPreparationGuide({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "fr") redirect(path);

  return (
    <article className="bg-sand-light">
      <header className="mx-auto grid max-w-6xl items-center gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12">
        <div>
          <Link href="/proprietaires" className="text-sm font-semibold text-lagoon underline underline-offset-4">
            ← Espace propriétaires
          </Link>
          <h1 className="hero-title mt-4 font-serif text-4xl font-semibold text-lagoon-dark sm:text-5xl">{title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Vous louez votre villa à Santa Giulia, Palombaggia ou autour de Porto-Vecchio ? Voici les vérifications à faire avant d’accueillir vos premiers voyageurs, même si vous préparez la saison à distance.
          </p>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
          <Image src={image} alt={photoAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-5 px-4 pb-14 sm:px-6 sm:pb-20">
        {steps.map(({ title, items }) => (
          <section key={title} className="rounded-2xl border border-sand/60 bg-white p-5 sm:p-7">
            <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{title}</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-foreground/85 marker:text-lagoon">
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ))}
        <section className="rounded-2xl border border-sand/60 p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">Vous préparez la saison à distance ?</h2>
          <p className="mt-3 leading-relaxed text-foreground/85">
            Avant de publier les premières dates, identifiez ce que vous souhaitez gérer vous-même et ce qui nécessite une présence sur place, comme la remise des clés, le ménage ou le passage d’un artisan.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/contact#rendez-vous">Prendre rendez-vous</Button>
            <Button href="/formules" variant="outline">Découvrir nos formules</Button>
            <Button href="/zone-intervention" variant="ghost">Voir nos zones d’intervention</Button>
          </div>
        </section>
      </div>
    </article>
  );
}
