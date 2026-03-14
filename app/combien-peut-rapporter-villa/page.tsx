import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import EstimerRevenusForm from "@/components/EstimerRevenusForm";

export const metadata: Metadata = {
  title: "Combien peut rapporter votre villa ? – Estimation ZenVilla",
  description:
    "Estimez les revenus locatifs de votre villa à Santa Giulia, Porto-Vecchio. Prix moyen nuit ~300 €, revenus annuels 36 000 € à 70 000 €. Demandez une estimation gratuite.",
  openGraph: {
    title: "Combien peut rapporter votre villa ? | ZenVilla",
    description:
      "Estimation gratuite des revenus locatifs. Villa Santa Giulia, Porto-Vecchio. ZenVilla vous accompagne.",
  },
};

export default function CombienPeutRapporterVillaPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-eau.png"
            alt="Villa Corse Sud - estimation revenus locatifs"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg">
            Combien peut rapporter votre villa ?
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto">
            Estimation gratuite du potentiel de revenus de votre villa à Santa Giulia, Porto-Vecchio et Corse Sud.
          </p>
        </div>
      </section>

      {/* Contenu + formulaire */}
      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-lagoon-dark mb-6">
                Exemple : Villa à Santa Giulia
              </h2>
              <div className="bg-white rounded-2xl border border-sand/50 p-8">
                <ul className="space-y-3 text-foreground/90">
                  <li>• Prix moyen nuit : <strong>300 €</strong></li>
                  <li>• ~120 nuits louées par an</li>
                  <li>• <strong className="text-lagoon-dark">Revenu annuel estimé : 36 000 € à 70 000 €</strong></li>
                </ul>
                <p className="mt-6 text-lagoon font-medium">
                  Avec ZenVilla : optimisation des revenus + gestion complète sans stress.
                </p>
              </div>
              <p className="mt-6 text-foreground/80 leading-relaxed">
                Chaque villa est unique. En fonction de la localisation, du nombre de chambres, de la saisonnalité et de la qualité de l&apos;annonce, les revenus varient. Remplissez le formulaire pour obtenir une estimation personnalisée et gratuite.
              </p>
              <Button href="/packs" variant="outline" className="mt-6">
                Découvrir nos packs
              </Button>
            </div>
            <div>
              <EstimerRevenusForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
