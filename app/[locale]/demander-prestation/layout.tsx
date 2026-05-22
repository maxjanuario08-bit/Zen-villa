import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const desc = t("demanderDesc");
  return {
    title: t("demanderPage"),
    description: desc,
    openGraph: {
      title: t("demanderPage"),
      description: t("demanderOg"),
    },
    robots: { index: true, follow: true },
  };
}

export default function DemanderPrestationLayout({ children }: Omit<Props, "params">) {
  return children;
}
