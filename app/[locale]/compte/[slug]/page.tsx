import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ownerOwnsSlug, requireOwner } from "@/lib/owner-auth";
import OwnerPropertyDashboard from "@/components/owner/OwnerPropertyDashboard";

type Props = {params:Promise<{locale:string;slug:string}>};
export default async function CompteLogementPage({params}:Props) {
  const {locale,slug}=await params;
  setRequestLocale(locale);
  const session=await requireOwner();
  if(!ownerOwnsSlug(session,slug))notFound();
  return <OwnerPropertyDashboard locale={locale} slug={slug} session={session}/>;
}
