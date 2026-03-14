import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EstimerRevenusForm from "@/components/EstimerRevenusForm";

export const metadata: Metadata = {
  title: "Conciergerie Porto-Vecchio – Gestion villa & Airbnb",
  description:
    "Conciergerie premium pour villas à Porto-Vecchio. Gestion Airbnb, optimisation revenus, Santa Giulia, Palombaggia. ZenVilla vous accompagne.",
  openGraph: {
    title: "Conciergerie Porto-Vecchio | ZenVilla – Gestion villas Corse Sud",
    description:
      "Confiez la gestion de votre villa à Porto-Vecchio. Expertise locale, optimisation revenus, gestion complète.",
  },
};

export default function ConciergeriePortoVecchioPage() {
  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-eau.png"
            alt="Conciergerie villa Porto-Vecchio - plages Santa Giulia"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg">
            Conciergerie villa Porto-Vecchio
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto">
            Gestion complète de votre villa à Santa Giulia, Palombaggia et Porto-Vecchio. Maximisez vos revenus locatifs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/combien-peut-rapporter-villa" variant="primary" className="!bg-white !text-lagoon hover:!bg-sand-light">
              Estimer mes revenus
            </Button>
            <Button href="/proprietaires" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark">
              Découvrir nos packs
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-lagoon-dark text-center mb-8">
            Conciergerie villa luxe Porto-Vecchio – ZenVilla
          </h2>
          <div className="prose prose-lg text-foreground/90 space-y-4">
            <p>
              <strong>ZenVilla</strong> est votre conciergerie de référence à Porto-Vecchio et en Corse Sud. Nous gérons votre villa de prestige à Santa Giulia, Palombaggia, ou ailleurs dans la région : optimisation des annonces Airbnb et Booking, check-in/check-out, ménage, maintenance, assistance voyageurs 7j/7.
            </p>
            <p>
              Confiez-nous la gestion de votre bien et maximisez vos revenus locatifs tout en profitant d&apos;une tranquillité totale. Estimation gratuite de vos revenus sur demande.
            </p>
          </div>
          <div className="mt-12 max-w-md mx-auto">
            <EstimerRevenusForm />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-lagoon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-white mb-6">
            Prêt à confier votre villa à Porto-Vecchio ?
          </h2>
          <Button href="/proprietaires" variant="secondary" className="!bg-white !text-lagoon hover:!bg-sand-light">
            Découvrir ZenVilla
          </Button>
        </div>
      </section>
    </div>
  );
}
