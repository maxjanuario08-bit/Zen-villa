import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { homeServices } from "@/lib/services";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
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
            Conciergerie pour villas à Santa Giulia et Porto-Vecchio
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-100">
            Maximisez vos revenus locatifs pendant que nous gérons tout pour vous.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
            <Button href="/proprietaires" variant="primary" className="!bg-white !text-lagoon hover:!bg-sand-light">
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
            Pourquoi nous choisir
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              "Expertise locale Santa Giulia & Porto-Vecchio",
              "Gestion complète de A à Z",
              "Optimisation revenus Airbnb & Booking",
              "Assistance voyageurs 7j/7",
              "Réseau de services premium",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-lagoon mt-0.5 font-bold">✓</span>
                <span className="text-foreground/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-12">
            Nos services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeServices.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <Card className="text-center h-full hover:border-lagoon/40 cursor-pointer transition-all">
                  <ServiceIcon name={service.icon} />
                  <h3 className="font-serif text-xl font-medium text-lagoon-dark">
                    {service.label}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/70">
                    En savoir plus →
                  </p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href="/proprietaires" variant="primary">
              Voir notre offre pour les propriétaires
            </Button>
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
            Obtenez une estimation de vos revenus et découvrez nos packs Zen Tranquillité, Zen Premium ou à la carte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/combien-peut-rapporter-villa"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-lagoon hover:bg-sand-light transition-colors"
            >
              Estimer mes revenus
            </Link>
            <Link
              href="/packs"
              className="rounded-full border-2 border-white px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Découvrir nos packs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
