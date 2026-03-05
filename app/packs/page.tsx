import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Packs – Zen Tranquillité, Zen Premium, Zen Flex",
  description:
    "Découvrez nos 3 packs conciergerie : Zen Tranquillité (essentiel), Zen Premium (tout inclus), Zen Flex (à l'usage). Tarifs transparents.",
  openGraph: {
    title: "Nos packs | Zenvilla – Conciergerie Corse Sud",
    description:
      "Packs conciergerie pour propriétaires : essentiel, premium ou à l'usage. Choisissez selon vos besoins.",
  },
};

const packs = [
  {
    nom: "Zen Tranquillité",
    sousTitre: "Pack Essentiel",
    tarif: "1 600 € / villa",
    tarifLabel: "Tarif saison",
    description: "Pour les propriétaires qui veulent la sérénité sur place.",
    inclus: [
      "Check-in / Check-out des voyageurs",
      "Ménage complet et préparation de la villa",
      "Gestion du linge",
      "Tout suivi via notre application digitale",
      "Assistance locale en cas de besoin",
      "Cadeau de bienvenue pour vos voyageurs",
    ],
    featured: false,
  },
  {
    nom: "Zen Premium",
    sousTitre: "Pack Premium",
    tarif: "20% sur le CA locatif",
    tarifLabel: "Commission",
    description: "Pour les propriétaires qui veulent zéro gestion et maximiser leurs revenus.",
    inclus: [
      "Tout le Pack Essentiel +",
      "Création et optimisation des annonces Airbnb, Booking, Abritel…",
      "Shooting photos pro & mise en valeur de la villa",
      "Gestion du calendrier et des réservations",
      "Réponses aux voyageurs 7j/7",
    ],
    featured: true,
  },
  {
    nom: "Zen Flex",
    sousTitre: "Pack Sérénité",
    tarif: "180 €",
    tarifLabel: "Tarif pour la prestation",
    description: "Pour les propriétaires qui veulent payer à l'usage.",
    inclus: [
      "Check-in / Check-out",
      "Ménage complet et préparation de la villa",
      "Gestion du linge",
      "Tout suivi via notre application digitale transparente",
      "Petit cadeau de bienvenue pour vos voyageurs",
    ],
    featured: false,
  },
];

export default function PacksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-packs.png"
            alt="Côte corse - plages et eaux turquoise"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/45" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            Nos packs
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Choisissez le pack adapté à vos besoins : de l'essentiel à la gestion
            complète, en toute transparence.
          </p>
          <Button
            href="/contact"
            variant="primary"
            className="mt-10 !bg-white !text-lagoon hover:!bg-sand-light animate-fade-in-up animation-delay-200"
          >
            Demander un devis
          </Button>
        </div>
      </section>

      {/* Packs grid */}
      <section className="py-12 sm:py-20 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packs.map((pack) => (
              <Card
                key={pack.nom}
                hover={false}
                className={`relative flex flex-col ${
                  pack.featured
                    ? "lg:-mt-4 lg:mb-4 border-2 border-lagoon shadow-lg ring-2 ring-lagoon/20"
                    : ""
                }`}
              >
                {pack.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-lagoon px-4 py-1 text-xs font-medium text-white">
                      Populaire
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">
                    {pack.nom}
                  </h2>
                  <p className="text-sm text-lagoon/80 mt-1">{pack.sousTitre}</p>
                  <div className="mt-6 space-y-2">
                    {pack.inclus.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="text-lagoon mt-0.5">✓</span>
                        <span className="text-foreground/90 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-sm text-muted italic">
                    {pack.description}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-sand/50">
                  <p className="text-xs text-muted uppercase tracking-wider">
                    {pack.tarifLabel}
                  </p>
                  <p className="font-serif text-2xl font-semibold text-lagoon-dark mt-1">
                    {pack.tarif}
                  </p>
                  <Button
                    href="/contact"
                    variant={pack.featured ? "primary" : "outline"}
                    className="w-full mt-4 !rounded-full justify-center"
                  >
                    Demander un devis
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
