import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLogement } from "@/lib/logements";
import { requireOwner } from "@/lib/owner-auth";
import OwnerPropertyDashboard from "@/components/owner/OwnerPropertyDashboard";

type Props = {params:Promise<{locale:string}>};
export default async function ComptePage({params}:Props) {
  const {locale}=await params;
  setRequestLocale(locale);
  const session=await requireOwner();
  const slug=session.logements.find(slug=>Boolean(getLogement(slug)?.booking));
  if(slug)return <OwnerPropertyDashboard locale={locale} slug={slug} session={session}/>;
  const t=await getTranslations({locale,namespace:"Compte"});
  return <section className="bg-sand-light px-4 py-12"><div className="mx-auto max-w-6xl"><h1 className="font-serif text-3xl font-semibold text-lagoon-dark">{t("dashHello",{name:session.name})}</h1><p className="mt-5 text-sm text-muted">{t("dashEmpty")}</p></div></section>;
}
