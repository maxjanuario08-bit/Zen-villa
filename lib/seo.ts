import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

/** Liens canonique + hreflang pour une page (chemin sans locale, ex. `/logements`). */
export function languageAlternates(locale: string, path: string): Metadata["alternates"] {
  const suffix = path === "/" ? "" : path;
  const urlFor = (code: string) =>
    code === "fr" ? `${SITE.url}${suffix || ""}` : `${SITE.url}/${code}${suffix}`;
  return {
    canonical: urlFor(locale),
    languages: {
      fr: urlFor("fr"),
      en: urlFor("en"),
      es: urlFor("es"),
      "x-default": urlFor("fr"),
    },
  };
}
