import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Logements" });
  const title = t("bookMetaTitle");
  const description = t("bookMetaDesc");
  return {
    title,
    description,
    openGraph: {
      title: t("bookOgTitle"),
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default function BookLayout({ children }: { children: ReactNode }) {
  return children;
}
