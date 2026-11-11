import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/lib/seo";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const desc = t("demanderDesc");
  return {
    ...localizedPageMetadata({
      locale,
      path: "/demander-prestation",
      title: t("demanderPage"),
      description: desc,
      openGraphDescription: t("demanderOg"),
    }),
    robots: { index: true, follow: true },
  };
}

export default function DemanderPrestationLayout({ children }: Omit<Props, "params">) {
  return children;
}
