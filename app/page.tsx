import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ServiceIcon from "@/components/icons/ServiceIcon";
import type { IconName } from "@/components/icons/ServiceIcons";

const services: { label: string; icon: IconName }[] = [
  { label: "Accueil check in/out", icon: "check-in" },
  { label: "Ménage professionnel", icon: "menage" },
  { label: "Gestion des réservations", icon: "reservations" },
  { label: "Maintenance des villas", icon: "maintenance" },
  { label: "Services et activités", icon: "activites" },
  { label: "Assistance 7/7j", icon: "assistance" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-baie.png"
            alt="Baie de Corse Sud - vue mer turquoise"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/40" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            Zenvilla – Conciergerie Corse Sud
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-100">
            Une solution complète et digitale pour gérer la location de villas de
            prestige en toute transparence et simplicité.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
            <Button href="/packs" variant="primary">
              Découvrir nos packs
            </Button>
            <Button href="/contact" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-lagoon-dark">
              Demander un devis
            </Button>
          </div>
        </div>
      </section>

      {/* Nos prestations */}
      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-8 animate-fade-in-up">
            Nos prestations
          </h2>
          <div className="text-center space-y-4 text-foreground/90 leading-relaxed animate-fade-in-up animation-delay-100">
            <p>
              Nous proposons une solution complète et digitale de conciergerie
              destinée aux propriétaires de villas et aux voyageurs.
            </p>
            <p>
              Notre application et nos services personnalisés permettent de
              gérer la location de biens de prestige en toute transparence et
              simplicité.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12 animate-fade-in-up">
            Nos services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <Card key={service.label} className="text-center">
                <ServiceIcon name={service.icon} />
                <h3 className="font-serif text-xl font-medium text-lagoon-dark">
                  {service.label}
                </h3>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href="/contact" variant="primary">
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-lagoon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white mb-6">
            Propriétaire ou voyageur ?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Découvrez comment Zenvilla peut simplifier la gestion de votre villa
            ou embellir votre séjour en Corse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/proprietaires"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-lagoon hover:bg-sand-light transition-colors"
            >
              Je suis propriétaire
            </Link>
            <Link
              href="/voyageurs"
              className="rounded-full border-2 border-white px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Je suis voyageur
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
