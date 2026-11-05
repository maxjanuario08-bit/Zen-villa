import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLogement } from "@/lib/logements";
import { getOwnerCalendarPayload } from "@/lib/owner-calendar";
import { getCleaningsForSlug } from "@/lib/owner-data";
import type { OwnerSession } from "@/lib/owner-types";
import OwnerWorkspace from "./OwnerWorkspace";

export default async function OwnerPropertyDashboard({locale,slug,session}:{locale:string;slug:string;session:OwnerSession}) {
  const property=getLogement(slug);
  if(!session.logements.includes(slug) || !property?.booking) notFound();
  const [t,calendar,cleanings]=await Promise.all([
    getTranslations({locale,namespace:"Logements"}),
    getOwnerCalendarPayload(slug),
    getCleaningsForSlug(slug),
  ]);
  const properties=session.logements.flatMap(slug=>{const property=getLogement(slug);return property?.booking?[{slug,name:t(`${property.copyKey}.name`)}]:[];});
  return <OwnerWorkspace name={session.name} slug={slug} propertyName={t(`${property.copyKey}.name`)} tagline={t(`${property.copyKey}.tagline`)} image={property.image} maxGuests={property.guests} properties={properties} booking={property.booking} stays={calendar.stays} cleanings={cleanings} calendar={calendar}/>;
}
