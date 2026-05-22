import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { homeServices } from "@/lib/services";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return homeServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = homeServices.find((s) => s.slug === slug);
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  if (!service)
    return { title: `${tCommon("serviceNotFound")} | ZenVilla` };

  const tOwner = await getTranslations({ locale, namespace: "ownerServices" });
  return {
    title: `${tOwner(`${slug}.label`)} | ZenVilla`,
    description: tOwner(`${slug}.description`),
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const service = homeServices.find((s) => s.slug === slug);

  if (!service) notFound();

  const tOwner = await getTranslations({ locale, namespace: "ownerServices" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const label = tOwner(`${slug}.label`);
  const description = tOwner(`${slug}.description`);
  const details = tOwner.raw(`${slug}.details`) as readonly string[];

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-baie.png"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium mb-6"
          >
            ← {tCommon("backHome")}
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
              <ServiceIcon name={service.icon} iconClassName="!text-white !w-14 !h-14" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-white">{label}</h1>
              <p className="mt-2 text-white/90 max-w-2xl">{description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-semibold text-lagoon-dark mb-8">{tCommon("inDetail")}</h2>
          <ul className="space-y-4">
            {details.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-lagoon mt-0.5 text-xl">✓</span>
                <span className="text-foreground/90 text-lg">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 pt-8 border-t border-sand/50">
            <div className="flex flex-wrap gap-4">
              <Button href="/contact" variant="primary">
                {tCommon("learnMore")}
              </Button>
              <Button href="/" variant="outline">
                {tCommon("backHome")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
