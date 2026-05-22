import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { voyageursServices } from "@/lib/voyageurs-services";

export default async function VoyageursPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const tGuests = await getTranslations({ locale, namespace: "GuestsIndex" });
  const tGuestSvcs = await getTranslations({ locale, namespace: "guestServices" });
  const tFooter = await getTranslations({ locale, namespace: "Footer" });

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-cote.png"
            alt={tGuests("heroAlt")}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/45" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg animate-fade-in-up">
            {tGuests("heroTitle")}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            {tGuests("heroSubtitle")}
          </p>
          <Button
            href="/demander-prestation"
            variant="primary"
            className="mt-10 !bg-white !text-lagoon hover:!bg-sand-light animate-fade-in-up animation-delay-200"
          >
            {tFooter("linkRequestService")}
          </Button>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-lagoon-dark text-center mb-4">
            {tGuests("servicesHeading")}
          </h2>
          <p className="text-center text-foreground/80 mb-12 max-w-2xl mx-auto">{tGuests("servicesIntro")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {voyageursServices.map((service) => (
              <Link key={service.slug} href={`/voyageurs/${service.slug}`}>
                <Card className="h-full hover:border-lagoon/40 cursor-pointer transition-all">
                  <ServiceIcon name={service.icon} />
                  <h3 className="font-serif text-xl font-medium text-lagoon-dark">
                    {tGuestSvcs(`${service.slug}.label`)}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/70">{tGuests("hint")}</p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href="/demander-prestation" variant="primary">
              {tFooter("linkRequestService")}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-lagoon">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white mb-6">{tGuests("ctaTitle")}</h2>
          <p className="text-white/90 text-lg mb-8">{tGuests("ctaBody")}</p>
          <Button
            href="/demander-prestation"
            variant="secondary"
            className="!bg-white !text-lagoon hover:!bg-sand-light"
          >
            {tFooter("linkRequestService")}
          </Button>
        </div>
      </section>
    </div>
  );
}
