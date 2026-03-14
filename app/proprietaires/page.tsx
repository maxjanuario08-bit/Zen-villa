import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { proprietairesAvantages } from "@/lib/proprietaires-avantages";

export const metadata: Metadata = {
  title: "Propriétaires – Conciergerie villa Santa Giulia & Porto-Vecchio",
  description:
    "Confiez votre villa à ZenVilla. Gestion complète, optimisation revenus Airbnb, expertise locale Santa Giulia et Porto-Vecchio. Demandez une estimation gratuite.",
  openGraph: {
    title: "Propriétaires | ZenVilla – Conciergerie villa Corse Sud",
    description:
      "Conciergerie premium pour villas. Maximisez vos revenus locatifs, zéro gestion, assistance 7j/7.",
  },
};

const pourquoiZenVilla = [
  "Expertise locale Santa Giulia & Porto-Vecchio",
  "Gestion complète de A à Z",
  "Optimisation revenus Airbnb & Booking",
  "Assistance voyageurs 7j/7",
  "Réseau de services premium",
];

const processus = [
  { step: 1, titre: "Estimation des revenus", desc: "Évaluation gratuite du potentiel de votre villa" },
  { step: 2, titre: "Signature du contrat", desc: "Engagement clair et transparent" },
  { step: 3, titre: "Création de l'annonce", desc: "Photos pro, texte optimisé pour les plateformes" },
  { step: 4, titre: "Gestion des voyageurs", desc: "Accueil, ménage, réponses 7j/7" },
  { step: 5, titre: "Optimisation revenus", desc: "Tarifs dynamiques, suivi temps réel" },
];

export default function ProprietairesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-eau.png"
            alt="Villa Corse Sud - Santa Giulia Porto-Vecchio"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            Confiez votre villa à une conciergerie premium à Santa Giulia – Porto-Vecchio
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Maximisez vos revenus locatifs pendant que nous gérons tout pour vous.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
            <Button href="/packs" variant="primary" className="!bg-white !text-lagoon hover:!bg-sand-light">
              Confier ma villa
            </Button>
            <Button href="/combien-peut-rapporter-villa" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark">
              Estimer mes revenus
            </Button>
          </div>
        </div>
      </section>

      {/* Pourquoi ZenVilla */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            Pourquoi ZenVilla ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {pourquoiZenVilla.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-lagoon mt-0.5 font-bold text-lg">✓</span>
                <span className="text-foreground/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça fonctionne */}
      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            Comment ça fonctionne
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {processus.map(({ step, titre, desc }) => (
              <div key={step} className={`text-center ${step === 5 ? "min-w-[180px]" : ""}`}>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lagoon text-white font-serif font-semibold text-lg mb-4">
                  {step}
                </span>
                <h3 className={`font-serif text-lg font-medium text-lagoon-dark mb-2 ${step === 5 ? "whitespace-nowrap" : ""}`}>{titre}</h3>
                <p className={`text-sm text-foreground/80 ${step === 5 ? "whitespace-nowrap" : ""}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages détaillés */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            Pourquoi confier votre villa à ZenVilla ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proprietairesAvantages.map((item) => (
              <Link key={item.slug} href={`/proprietaires/${item.slug}`}>
                <Card className="h-full hover:border-lagoon/40 cursor-pointer transition-all">
                  <ServiceIcon name={item.icon} />
                  <h3 className="font-serif text-xl font-medium text-lagoon-dark mb-2">
                    {item.titre}
                  </h3>
                  <p className="text-foreground/80 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="mt-3 text-sm text-lagoon font-medium">
                    En savoir plus →
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-lagoon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white mb-6">
            Prêt à confier votre villa ?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Obtenez une estimation gratuite de vos revenus et découvrez nos packs Zen Tranquillité, Zen Premium ou à la carte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/combien-peut-rapporter-villa"
              variant="secondary"
              className="!bg-white !text-lagoon hover:!bg-sand-light"
            >
              Estimer mes revenus
            </Button>
            <Button
              href="/packs"
              variant="outline"
              className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark"
            >
              Voir nos packs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
