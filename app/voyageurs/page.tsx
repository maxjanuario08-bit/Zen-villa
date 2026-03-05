import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ServiceIcon from "@/components/icons/ServiceIcon";
import type { IconName } from "@/components/icons/ServiceIcons";

export const metadata: Metadata = {
  title: "Voyageurs – Prestations & services villa Corse",
  description:
    "Profitez de prestations premium pour votre séjour en villa en Corse Sud : transport, petit-déjeuner, activités nautiques, location paddle et plus.",
  openGraph: {
    title: "Voyageurs | Zenvilla – Conciergerie Corse Sud",
    description:
      "Services sur mesure pour voyageurs : transport, petit-déjeuner, activités, location de matériel nautique.",
  },
};

const services: { label: string; icon: IconName }[] = [
  { label: "Service de transport", icon: "voiture" },
  { label: "Service petit-déjeuner", icon: "petit-dejeuner" },
  { label: "Service linge", icon: "linge" },
  { label: "Livraison des courses", icon: "courses" },
  { label: "Activités nautiques", icon: "nautique" },
  { label: "Balades équestres", icon: "equestre" },
  { label: "Visite et randonnée", icon: "randonnee" },
  { label: "Location paddle", icon: "paddle" },
  { label: "Location de scooter", icon: "scooter" },
];

export default function VoyageursPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-cote.png"
            alt="Côte méditerranéenne - mer turquoise et rochers"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/45" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            Prestations aux voyageurs
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Pour un séjour en tout confort en villa de prestige en Corse Sud.
          </p>
          <Button
            href="/contact"
            variant="primary"
            className="mt-10 !bg-white !text-lagoon hover:!bg-sand-light animate-fade-in-up animation-delay-200"
          >
            Demander une prestation
          </Button>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-4">
            Nos services pour votre séjour
          </h2>
          <p className="text-center text-foreground/80 mb-12 max-w-2xl mx-auto">
            Des prestations sur mesure pour rendre votre villégiature en Corse
            encore plus agréable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.label}>
                <ServiceIcon name={service.icon} />
                <h3 className="font-serif text-xl font-medium text-lagoon-dark">
                  {service.label}
                </h3>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href="/contact" variant="primary">
              Nous contacter
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-lagoon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white mb-6">
            Un séjour sur mesure ?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Que ce soit pour organiser une sortie en mer, une livraison de
            courses ou une balade à cheval, notre équipe est à votre écoute.
          </p>
          <Button
            href="/contact"
            variant="secondary"
            className="!bg-white !text-lagoon hover:!bg-sand-light"
          >
            Demander une prestation
          </Button>
        </div>
      </section>
    </div>
  );
}
