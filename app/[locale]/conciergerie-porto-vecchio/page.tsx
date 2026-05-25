import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Conciergerie Porto-Vecchio – Gestion villa & Airbnb",
  description:
    "Conciergerie pour villas à Porto-Vecchio. Gestion Airbnb, Santa Giulia, Palombaggia. ZenVilla vous accompagne en Corse Sud.",
  openGraph: {
    title: "Conciergerie Porto-Vecchio | ZenVilla – Gestion villas Corse Sud",
    description:
      "Confiez la gestion de votre villa à Porto-Vecchio. Expertise locale, gestion complète.",
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
            Gestion complète de votre villa à Santa Giulia, Palombaggia et Porto-Vecchio — en toute sérénité.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact" variant="primary" className="!bg-white !text-lagoon hover:!bg-sand-light">
              Nous contacter
            </Button>
            <Button href="/packs" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark">
              Découvrir nos packs
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-lagoon-dark text-center mb-8">
            Conciergerie villa Porto-Vecchio – ZenVilla
          </h2>
          <div className="prose prose-lg text-foreground/90 space-y-4">
            <p>
              <strong>ZenVilla</strong> est votre conciergerie de référence à Porto-Vecchio et en Corse Sud. Nous gérons votre villa à Santa Giulia, Palombaggia ou ailleurs dans la région : annonces Airbnb et Booking, check-in/check-out, ménage, maintenance et assistance voyageurs 7j/7.
            </p>
            <p>
              Confiez-nous la gestion de votre bien pour une location sereine tout au long de l&apos;année.
            </p>
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
