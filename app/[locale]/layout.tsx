import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { SITE } from "@/lib/constants";
import { routing } from "@/i18n/routing";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

type Props = Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const ogLocale =
    locale === "fr" ? "fr_FR" : locale === "es" ? "es_ES" : "en_US";

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: t("siteTitle"),
      template: "%s | Zenvilla",
    },
    description: t("siteDescription"),
    keywords: [
      "conciergerie",
      "Corse",
      "villa",
      "location",
      "prestige",
      "Bonifacio",
      "Porto-Vecchio",
      "Propriano",
      "Sartène",
      "location saisonnière",
    ],
    authors: [{ name: "Zenvilla", url: SITE.url }],
    creator: "Zenvilla",
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: SITE.url,
      siteName: SITE.name,
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: [
        {
          url: SITE.ogImage,
          width: 1200,
          height: 630,
          alt: "Zenvilla – Conciergerie Corse Sud",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteTitle"),
      description: t("siteDescription"),
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [{ url: "/logo.png", type: "image/png" }],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className={`${cormorant.variable} ${sourceSans.variable}`}
    >
      <body className="antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
