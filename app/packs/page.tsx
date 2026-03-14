import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Packs – Zen Tranquillité, Zen Premium & À la carte",
  description:
    "Découvrez nos packs conciergerie : Zen Tranquillité, Zen Premium ou prestations à la carte. Santa Giulia, Porto-Vecchio, Corse Sud.",
  openGraph: {
    title: "Nos packs | Zenvilla – Conciergerie Corse Sud",
    description:
      "Packs conciergerie pour propriétaires : essentiel, premium, à l'usage ou prestations à la carte.",
  },
};

const packs = [
  {
    nom: "Zen Tranquillité",
    sousTitre: "Pack Essentiel",
    image: "/hero-eau.png",
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
    image: "/hero-packs.png",
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
    nom: "À la carte",
    sousTitre: "Prestations unitaires",
    image: "/hero-eau.png",
    description: "Pour les propriétaires qui gèrent eux-mêmes leur location et souhaitent déléguer uniquement certaines prestations.",
    inclus: [
      "Check-in / Check-out uniquement",
      "Ménage entre deux séjours",
      "Maintenance ponctuelle",
      "Assistance voyageurs sur demande",
      "Tarification au forfait par prestation",
    ],
    featured: false,
  },
];

export default function PacksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
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
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            Nos packs
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Choisissez le pack adapté à vos besoins : Zen Tranquillité, Zen Premium ou prestations à la carte.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {packs.map((pack) => (
              <Card
                key={pack.nom}
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
                      Populaire
                    </span>
                  </div>
                )}
                <div className="h-40 sm:h-44 shrink-0 relative">
                  <Image
                    src={pack.image}
                    alt={pack.nom}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-lagoon-dark/20" />
                </div>
                <div className="flex flex-col flex-1 p-6 sm:p-8">
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
                  <p className="mt-6 text-sm text-muted italic flex-1">
                    {pack.description}
                  </p>
                </div>
                <div className="mt-auto pt-6 border-t border-sand/50 px-6 sm:px-8 pb-6">
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
