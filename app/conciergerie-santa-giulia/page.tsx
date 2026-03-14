import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EstimerRevenusForm from "@/components/EstimerRevenusForm";

export const metadata: Metadata = {
  title: "Conciergerie Santa Giulia – Gestion villa & Airbnb Porto-Vecchio",
  description:
    "Conciergerie pour villas à Santa Giulia. Gestion Airbnb, optimisation revenus, plage Santa Giulia. ZenVilla, expertise locale Corse Sud.",
  openGraph: {
    title: "Conciergerie Santa Giulia | ZenVilla – Gestion villas",
    description:
      "Conciergerie premium Santa Giulia et Porto-Vecchio. Gestion complète, optimisation revenus.",
  },
};

export default function ConciergerieSantaGiuliaPage() {
  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-eau.png"
            alt="Conciergerie villa Santa Giulia - plage Porto-Vecchio"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg">
            Conciergerie villa Santa Giulia
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto">
            Expertise locale à Santa Giulia. Gestion Airbnb, optimisation revenus, plages de rêve.
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
            Conciergerie Santa Giulia – Gestion villa luxe Corse
          </h2>
          <div className="prose prose-lg text-foreground/90 space-y-4">
            <p>
              <strong>Santa Giulia</strong> est l&apos;une des plus belles plages de Corse. Si vous avez une villa dans ce secteur, <strong>ZenVilla</strong> vous propose une conciergerie premium : gestion complète Airbnb et Booking, accueil des voyageurs, ménage, optimisation des revenus.
            </p>
            <p>
              Notre équipe locale connaît Santa Giulia et Porto-Vecchio sur le bout des doigts. Confiez-nous votre villa et maximisez vos revenus locatifs. Estimation gratuite.
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
            Villa à Santa Giulia ? Confiez-la à ZenVilla
          </h2>
          <Button href="/proprietaires" variant="secondary" className="!bg-white !text-lagoon hover:!bg-sand-light">
            Découvrir ZenVilla
          </Button>
        </div>
      </section>
    </div>
  );
}
