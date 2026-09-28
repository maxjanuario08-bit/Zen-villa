import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { languageAlternates } from "@/lib/seo";

type Props = Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Logements" });

  const title = t("metaTitle");
  const description = t("metaDesc");
  return {
    title,
    description,
    openGraph: {
      title: t("ogTitle"),
      description,
    },
    robots: { index: true, follow: true },
    alternates: languageAlternates(locale, "/logements"),
  };
}

export default function LogementsLayout({ children }: { children: ReactNode }) {
  return children;
}
