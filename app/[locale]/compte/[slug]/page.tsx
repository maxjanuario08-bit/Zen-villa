import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { BookingConfig } from "@/lib/booking";
import { getLogement } from "@/lib/logements";
import { ownerOwnsSlug, requireOwner } from "@/lib/owner-auth";
import { getOwnerCalendarPayload } from "@/lib/owner-calendar";
import { getCleaningsForSlug, getStaysForSlug } from "@/lib/owner-data";
import FinanceSummary from "@/components/owner/FinanceSummary";
import OwnerCalendar from "@/components/owner/OwnerCalendar";
import OwnerOps from "@/components/owner/OwnerOps";
import StayHistory from "@/components/owner/StayHistory";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function CompteLogementPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const session = await requireOwner();
  if (!ownerOwnsSlug(session, slug)) notFound();

  const logement = getLogement(slug);
  if (!logement?.booking) notFound();

  const t = await getTranslations({ locale, namespace: "Compte" });
  const tLog = await getTranslations({ locale, namespace: "Logements" });
  const calendar = await getOwnerCalendarPayload(slug);
  const stays = await getStaysForSlug(slug);
  const cleanings = await getCleaningsForSlug(slug);
  const year = new Date().getFullYear();
  const name = tLog(`${logement.copyKey}.name`);

  return (
    <section className="bg-sand-light py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link href="/compte" className="text-sm font-medium text-lagoon hover:text-lagoon-dark">
          ← {t("backToDash")}
        </Link>

        <div className="relative mt-5 overflow-hidden rounded-2xl">
          <div className="relative h-48 sm:h-64">
            <Image src={logement.image} alt={name} fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-0 bg-lagoon-dark/35" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <h1 className="font-serif text-3xl font-semibold text-white drop-shadow sm:text-4xl">{name}</h1>
            <p className="mt-1 text-sm text-white/90">{tLog(`${logement.copyKey}.tagline`)}</p>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <FinanceSummary
            locale={locale}
            stays={stays}
            booking={logement.booking as BookingConfig}
            year={year}
          />
          <OwnerCalendar
            slug={slug}
            stays={calendar.stays}
            ownerBlocks={calendar.ownerBlocks}
            closedMmdd={calendar.closedMmdd}
            maxGuests={logement.guests}
            cleanings={cleanings}
            icalImportUrl={calendar.icalImportUrl}
            icalExportPath={calendar.icalExportPath}
          />
          <OwnerOps slug={slug} stays={stays} cleanings={cleanings} />
          <StayHistory stays={stays} cleanings={cleanings} />
        </div>
      </div>
    </section>
  );
}
