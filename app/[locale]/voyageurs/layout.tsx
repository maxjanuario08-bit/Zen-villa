import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GuestsIndex" });
  const tTitles = await getTranslations({ locale, namespace: "Titles" });

  const title = t("metaTitleGuests");
  const description = t("metaDescGuests");
  return {
    title,
    description,
    openGraph: {
      title,
      description: tTitles("voyageursOg"),
    },
    robots: { index: true, follow: true },
  };
}

export default function VoyageursLayout({ children }: { children: ReactNode }) {
  return children;
}
