import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PasswordRecoveryForm from "@/components/owner/PasswordRecoveryForm";
import { accountRole } from "@/lib/password-credentials";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ role?: string; token?: string }> };
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function RecoveryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const role = accountRole(query.role) ?? "owner";
  const t = await getTranslations({ locale, namespace: "PasswordRecovery" });
  return <section className="bg-sand-light px-4 py-16 sm:py-24">
    <div className="mx-auto max-w-md">
      <h1 className="text-center font-serif text-3xl font-semibold text-lagoon-dark">{t("resetTitle")}</h1>
      <p className="mb-8 mt-4 text-center text-sm text-foreground/70">{t("resetLead")}</p>
      <div className="rounded-2xl bg-white p-6 shadow-card"><PasswordRecoveryForm role={role} reset token={query.token} /></div>
    </div>
  </section>;
}
