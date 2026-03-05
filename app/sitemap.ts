import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { voyageursServices } from "@/lib/voyageurs-services";
import { homeServices } from "@/lib/services";
import { proprietairesAvantages } from "@/lib/proprietaires-avantages";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;

  const servicesPages = homeServices.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const proprietairesPages = proprietairesAvantages.map((s) => ({
    url: `${baseUrl}/proprietaires/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const voyageursPages = voyageursServices.map((s) => ({
    url: `${baseUrl}/voyageurs/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1 },
    {
      url: `${baseUrl}/proprietaires`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/voyageurs`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/packs`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    ...servicesPages,
    ...proprietairesPages,
    ...voyageursPages,
  ];
}
