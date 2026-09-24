import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LogoutButton from "@/components/owner/LogoutButton";
import { requireOwner } from "@/lib/owner-auth";

type Props = Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Compte" });
  return {
    title: t("dashTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function CompteLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireOwner();
  const t = await getTranslations({ locale, namespace: "Compte" });

  return (
    <div>
      <div className="border-b border-sand/50 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-sm text-foreground/70">
            <Link href="/compte" className="font-medium text-lagoon-dark hover:text-lagoon">
              {t("dashTitle")}
            </Link>
            <span className="mx-2 text-sand-dark">·</span>
            {session.name}
          </p>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
