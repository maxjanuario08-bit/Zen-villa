import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ServiceIcon from "@/components/icons/ServiceIcon";
import type { IconName } from "@/components/icons/ServiceIcons";

export const metadata: Metadata = {
  title: "Propriétaires – Conciergerie villa Corse Sud",
  description:
    "Confiez la gestion de votre villa en Corse Sud à Zenvilla. Gain de temps, qualité premium, transparence via notre application, assistance 7j/7.",
  openGraph: {
    title: "Propriétaires | Zenvilla – Conciergerie Corse Sud",
    description:
      "Solution complète de conciergerie pour propriétaires de villas. Transparence, optimisation des revenus, zéro gestion.",
  },
};

const avantages: { titre: string; description: string; icon: IconName }[] = [
  {
    titre: "Gain de temps",
    description: "Déléguez toute la gestion de votre villa : réservations, ménage, maintenance, accueil des voyageurs.",
    icon: "temps",
  },
  {
    titre: "Qualité premium",
    description: "Des prestations haut de gamme pour préserver et valoriser votre bien de prestige.",
    icon: "qualite",
  },
  {
    titre: "Transparence totale",
    description: "Suivez l'activité de votre villa en temps réel via notre application digitale dédiée.",
    icon: "mobile",
  },
  {
    titre: "Assistance 7j/7",
    description: "Une équipe locale disponible tous les jours pour vos voyageurs et votre propriété.",
    icon: "assistance",
  },
  {
    titre: "Entretien & maintenance",
    description: "Ménage professionnel, gestion du linge, maintenance préventive et curative.",
    icon: "maintenance",
  },
  {
    titre: "Optimisation des revenus",
    description: "Pack Premium : création d'annonces, photos pro, gestion des plateformes pour maximiser votre CA locatif.",
    icon: "chart",
  },
];

export default function ProprietairesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-eau.png"
            alt="Côte corse - eaux turquoise et calanques"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            Propriétaires de villas
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Une conciergerie premium pour gérer votre villa en toute sérénité.
            Zéro stress, maximisation des revenus.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
            <Button href="/contact" variant="primary" className="!bg-white !text-lagoon hover:!bg-sand-light">
              Planifier un appel
            </Button>
            <Button href="/contact" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark">
              Demander un devis
            </Button>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            Pourquoi confier votre villa à Zenvilla ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {avantages.map((item) => (
              <Card key={item.titre}>
                <ServiceIcon name={item.icon} />
                <h3 className="font-serif text-xl font-medium text-lagoon-dark mb-2">
                  {item.titre}
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-lagoon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white mb-6">
            Prêt à déléguer ?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Demandez un devis personnalisé ou planifiez un appel pour découvrir
            nos packs adaptés à votre villa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/contact"
              variant="secondary"
              className="!bg-white !text-lagoon hover:!bg-sand-light"
            >
              Planifier un appel
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
