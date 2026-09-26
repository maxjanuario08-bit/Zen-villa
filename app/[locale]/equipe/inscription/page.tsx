import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import StaffSignupForm from "@/components/owner/StaffSignupForm";
import { getStaffSession, localeStaffPath } from "@/lib/owner-staff";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Equipe" });
  return {
    title: t("signupMeta"),
    robots: { index: false, follow: false },
  };
}

export default async function EquipeInscriptionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getStaffSession();
  if (session) redirect(localeStaffPath(locale));
  const t = await getTranslations({ locale, namespace: "Equipe" });

  return (
    <section className="bg-sand-light py-16 sm:py-24">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-center font-serif text-3xl font-semibold text-lagoon-dark sm:text-4xl">
          {t("signupTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-foreground/70">{t("signupLead")}</p>
        <Card className="mt-8" hover={false}>
          <StaffSignupForm />
        </Card>
      </div>
    </section>
  );
}
