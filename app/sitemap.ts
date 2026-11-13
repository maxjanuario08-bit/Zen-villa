import type { MetadataRoute } from "next";
import { logementsForRent } from "@/lib/logements";
import { SITE } from "@/lib/constants";
import { voyageursServices } from "@/lib/voyageurs-services";
import { homeServices } from "@/lib/services";
import { proprietairesAvantages } from "@/lib/proprietaires-avantages";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;

  const servicesPages = homeServices.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
  }));

  const proprietairesPages = proprietairesAvantages.map((s) => ({
    url: `${baseUrl}/proprietaires/${s.slug}`,
  }));

  const voyageursPages = voyageursServices.map((s) => ({
    url: `${baseUrl}/voyageurs/${s.slug}`,
  }));

  const frPages: MetadataRoute.Sitemap = [
    { url: baseUrl },
    { url: `${baseUrl}/proprietaires` },
    { url: `${baseUrl}/voyageurs` },
    { url: `${baseUrl}/formules` },
    { url: `${baseUrl}/contact` },
    { url: `${baseUrl}/demander-prestation` },
    { url: `${baseUrl}/zone-intervention` },
    { url: `${baseUrl}/mentions-legales` },
    { url: `${baseUrl}/politique-confidentialite` },
    { url: `${baseUrl}/logements` },
    ...logementsForRent.map((home) => ({
      url: `${baseUrl}/logements/${home.slug}`,
    })),
    ...servicesPages,
    ...proprietairesPages,
    ...voyageursPages,
  ];

  return frPages.map((page) => {
    const path = page.url.slice(baseUrl.length);
    const isFrenchOnlyPage = [
      "/mentions-legales",
      "/politique-confidentialite",
    ].includes(path);

    return {
      ...page,
      alternates: {
        languages: isFrenchOnlyPage
          ? {
              fr: `${baseUrl}${path}`,
              "x-default": `${baseUrl}${path}`,
            }
          : Object.fromEntries(
              routing.locales.map((locale) => [
                locale,
                locale === "fr" ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`,
              ]),
            ),
      },
    };
  });
}
