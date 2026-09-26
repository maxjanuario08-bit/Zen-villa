import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StaffLoginForm from "@/components/owner/StaffLoginForm";
import StaffLogoutButton from "@/components/owner/StaffLogoutButton";
import StaffOpsDesk from "@/components/owner/StaffOpsDesk";
import { logementsManaged } from "@/lib/logements";
import { getStaffSession } from "@/lib/owner-staff";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Equipe" });
  return {
    title: t("meta"),
    robots: { index: false, follow: false },
  };
}

export default async function EquipePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getStaffSession();
  const t = await getTranslations({ locale, namespace: "Equipe" });

  if (!session) {
    return (
      <section className="bg-sand-light py-16 sm:py-24">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <h1 className="text-center font-serif text-3xl font-semibold text-lagoon-dark sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-center text-sm text-foreground/70">{t("lead")}</p>
          <Card className="mt-8" hover={false}>
            <StaffLoginForm />
          </Card>
          <p className="mt-6 text-center">
            <Button href="/equipe/inscription" variant="outline" className="w-full">
              {t("signupLink")}
            </Button>
          </p>
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
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-lagoon-dark">{t("title")}</h1>
            <p className="mt-2 text-sm text-foreground/70">{t("deskLead")}</p>
            <p className="mt-1 text-sm font-medium text-lagoon-dark">{t("signedInAs", { name: session.name })}</p>
          </div>
          <StaffLogoutButton />
        </div>
        <StaffOpsDesk villas={villas} showCalendar={false} staffName={session.name} />
      </div>
    </section>
  );
}
