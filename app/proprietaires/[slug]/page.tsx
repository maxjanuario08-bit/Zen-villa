import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { proprietairesAvantages } from "@/lib/proprietaires-avantages";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return proprietairesAvantages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const avantage = proprietairesAvantages.find((s) => s.slug === slug);
  if (!avantage) return { title: "Avantage non trouvé" };
  return {
    title: `${avantage.titre} – Zenvilla Propriétaires`,
    description: avantage.description,
  };
}

export default async function ProprietaireAvantagePage({ params }: Props) {
  const { slug } = await params;
  const avantage = proprietairesAvantages.find((s) => s.slug === slug);

  if (!avantage) notFound();

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-eau.png"
            alt="Côte corse"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/proprietaires"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium mb-6"
          >
            ← Retour aux avantages
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
              <ServiceIcon name={avantage.icon} iconClassName="!text-white !w-14 !h-14" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-white">
                {avantage.titre}
              </h1>
              <p className="mt-2 text-white/90 max-w-2xl">
                {avantage.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-semibold text-lagoon-dark mb-8">
            En détail
          </h2>
          <ul className="space-y-4">
            {avantage.details.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-lagoon mt-0.5 text-xl">✓</span>
                <span className="text-foreground/90 text-lg">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 pt-8 border-t border-sand/50">
            <div className="flex flex-wrap gap-4">
              <Button href="/contact" variant="primary">
                Planifier un appel
              </Button>
              <Button href="/proprietaires" variant="outline">
                Voir tous les avantages
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
