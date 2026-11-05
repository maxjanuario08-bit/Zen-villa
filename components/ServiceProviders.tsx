import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import providers from "@/data/service-providers.json";
export default async function ServiceProviders({locale,service}:{locale:string;service:string}) {
  const entries=providers.filter(provider=>provider.enabled && provider.services.includes(service));
  if(!entries.length)return null;
  const t=await getTranslations({locale,namespace:"Pricing"});
  return <section className="mt-10 rounded-2xl border border-sand/60 bg-white p-6"><h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("providers")}</h2><p className="mt-3 text-sm text-muted">{t("providerBody")}</p><ul className="mt-5 grid gap-3 sm:grid-cols-2">{entries.map(provider=><li key={provider.id}><a href={provider.url} target="_blank" rel="noopener noreferrer" className="flex h-full items-center justify-between gap-4 rounded-xl border border-lagoon/25 p-4 font-medium text-lagoon hover:bg-lagoon/5"><span>{provider.name}<span className="mt-1 block text-xs font-normal">{t("visit")}</span></span><ExternalLink size={18} aria-hidden="true" className="shrink-0"/></a></li>)}</ul></section>;
}
