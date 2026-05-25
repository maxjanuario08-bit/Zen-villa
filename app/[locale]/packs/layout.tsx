import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Packs" });
  const tTitles = await getTranslations({ locale, namespace: "Titles" });

  const title = t("metaTitlePacks");
  const description = t("metaDescPacks");
  return {
    title,
    description,
    openGraph: {
      title: t("ogTitle"),
      description: tTitles("packsOg"),
    },
    robots: { index: true, follow: true },
  };
}

export default function PacksRootLayout({ children }: { children: ReactNode }) {
  return children;
}
