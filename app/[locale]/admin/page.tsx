import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Card from "@/components/ui/Card";
import AdminLoginForm from "@/components/owner/AdminLoginForm";
import AdminLogoutButton from "@/components/owner/AdminLogoutButton";
import AdminWorkspace from "@/components/owner/AdminWorkspace";
import { logementsManaged } from "@/lib/logements";
import { getAdminSession } from "@/lib/owner-admin";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return {
    title: t("meta"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getAdminSession();
  const t = await getTranslations({ locale, namespace: "Admin" });

  if (!session) {
    return (
      <section className="bg-sand-light py-16 sm:py-24">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <h1 className="text-center font-serif text-3xl font-semibold text-lagoon-dark sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-center text-sm text-foreground/70">{t("lead")}</p>
          <Card className="mt-8" hover={false}>
            <AdminLoginForm />
          </Card>
        </div>
      </section>
    );
  }

  const villas = logementsManaged.map((item) => ({
    slug: item.slug,
    copyKey: item.copyKey,
    guests: item.guests,
  }));

  return (
    <section className="bg-sand-light py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-lagoon-dark">{t("title")}</h1>
            <p className="mt-2 text-sm text-foreground/70">{t("workspaceLead")}</p>
          </div>
          <AdminLogoutButton />
        </div>
        <AdminWorkspace villas={villas} />
      </div>
    </section>
  );
}
