import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

type LocalizedPageMetadataInput = {
  locale: string;
  path: string;
  title: string;
  description: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  image?: string;
};

function localizedUrl(locale: string, path: string) {
  const suffix = path === "/" ? "" : path;
  return locale === "fr"
    ? `${SITE.url}${suffix}`
    : `${SITE.url}/${locale}${suffix}`;
}

/** Liens canonique + hreflang pour une page (chemin sans locale, ex. `/logements`). */
export function languageAlternates(locale: string, path: string): Metadata["alternates"] {
  return {
    canonical: localizedUrl(locale, path),
    languages: {
      fr: localizedUrl("fr", path),
      en: localizedUrl("en", path),
      es: localizedUrl("es", path),
      "x-default": localizedUrl("fr", path),
    },
  };
}

export function localizedPageMetadata({
  locale,
  path,
  title,
  description,
  openGraphTitle,
  openGraphDescription,
  image = SITE.ogImage,
}: LocalizedPageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: languageAlternates(locale, path),
    openGraph: {
      type: "website",
      url: localizedUrl(locale, path),
      siteName: SITE.name,
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
      images: [{ url: image, alt: SITE.name }],
    },
  };
}
