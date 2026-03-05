import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { SITE } from "@/lib/constants";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s | Zenvilla",
  },
  description: SITE.description,
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
    locale: "fr_FR",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "Zenvilla – Conciergerie Corse Sud" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${sourceSans.variable}`}>
      <body className="antialiased font-sans">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
