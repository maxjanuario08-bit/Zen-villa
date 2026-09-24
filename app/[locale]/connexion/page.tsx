import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import LoginForm from "@/components/owner/LoginForm";
import { getOwnerSession, localeComptePath } from "@/lib/owner-auth";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Compte" });
  return {
    title: t("loginMeta"),
    robots: { index: false, follow: false },
  };
}

export default async function ConnexionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getOwnerSession();
  if (session) redirect(localeComptePath(await getLocale()));

  const t = await getTranslations({ locale, namespace: "Compte" });

  return (
    <section className="bg-sand-light py-16 sm:py-24">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-center font-serif text-3xl font-semibold text-lagoon-dark sm:text-4xl">
          {t("loginTitle")}
        </h1>
        <p className="mt-4 text-center text-sm text-foreground/70">{t("loginLead")}</p>
        <Card className="mt-8" hover={false}>
          <LoginForm />
        </Card>
      </div>
    </section>
  );
}
