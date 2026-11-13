import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen, CalendarDays, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import OwnerLeadForm from "@/components/OwnerLeadForm";
import Button from "@/components/ui/Button";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { APPOINTMENT_URL } from "@/lib/appointments";
import { proprietairesAvantages } from "@/lib/proprietaires-avantages";

const benefits = proprietairesAvantages.filter(({ slug }) =>
  ["gain-de-temps", "transparence-totale", "entretien-maintenance"].includes(slug),
);

export default async function ProprietairesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [owners, benefit, lead, presentation, area] = await Promise.all([
    getTranslations("Owners"),
    getTranslations("ownerBenefits"),
    getTranslations("OwnerLead"),
    getTranslations("HomePresentation"),
    getTranslations("ServiceArea"),
  ]);
  const steps = presentation.raw("steps") as [string, string][];
  const leadCopy = {
    name: lead("name"),
    email: lead("email"),
    address: lead("address"),
    consent: lead("consent"),
    privacy: lead("privacy"),
    submit: lead("submit"),
    sending: lead("sending"),
    success: lead("success"),
    error: lead("error"),
  };

  return (
    <div className="bg-sand-light">
      <header className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-lagoon">{presentation("kicker")}</p>
          <h1 className="hero-title mt-3 font-serif text-4xl font-semibold leading-tight text-lagoon-dark sm:text-5xl">
            {owners("heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/80">
            {presentation("servicesIntro")}
          </p>
          <Link href="/zone-intervention" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-lagoon underline underline-offset-4">
            <MapPin size={18} aria-hidden="true" />
            {area("title")}
          </Link>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href={APPOINTMENT_URL || "/contact#rendez-vous"} className="gap-2">
              <CalendarDays size={18} aria-hidden="true" />
              {lead("appointment")}
            </Button>
            <Button href="#demande-proprietaire" variant="outline">{lead("submit")}</Button>
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
          <Image
            src="/santa-giulia-baie.jpg"
            alt={area("photoAlt")}
            fill
            preload
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </header>

      <section className="bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-3xl font-semibold text-lagoon-dark">{presentation("servicesTitle")}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {benefits.map(({ slug, icon }) => (
              <Link key={slug} href={`/proprietaires/${slug}`} className="group rounded-2xl border border-sand/60 bg-sand-light p-5 hover:border-lagoon/40">
                <ServiceIcon name={icon} />
                <h3 className="font-serif text-xl font-semibold text-lagoon-dark">{benefit(`${slug}.titre`)}</h3>
                <p className="mt-2 leading-relaxed text-foreground/80">{benefit(`${slug}.description`)}</p>
                <ArrowRight size={18} className="mt-4 text-lagoon" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <Button href="/formules" variant="outline" className="mt-6">{presentation("discover")}</Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h2 className="font-serif text-3xl font-semibold text-lagoon-dark">{presentation("processTitle")}</h2>
        <ol className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, description], index) => (
            <li key={title} className="border-t border-sand-dark/40 pt-4">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-lagoon/10 text-sm font-semibold text-lagoon-dark">{index + 1}</span>
              <h3 className="mt-3 font-semibold text-lagoon-dark">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="demande-proprietaire" className="scroll-mt-28 bg-white px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-2xl rounded-3xl border border-sand/60 bg-sand-light p-5 sm:p-8">
          <h2 className="mb-5 font-serif text-3xl font-semibold text-lagoon-dark">{lead("title")}</h2>
          <OwnerLeadForm copy={leadCopy} />
        </div>
      </section>

      {locale === "fr" && (
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <Link href="/blog/preparer-villa-saison-porto-vecchio" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-lagoon underline underline-offset-4">
            <BookOpen size={18} className="shrink-0" aria-hidden="true" />
            Préparer sa villa pour la saison à Porto-Vecchio
          </Link>
        </div>
      )}
    </div>
  );
}
