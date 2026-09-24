import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/compte",
          "/connexion",
          "/inscription",
          "/admin",
          "/equipe",
          "/en/compte",
          "/en/connexion",
          "/en/inscription",
          "/en/admin",
          "/en/equipe",
          "/es/compte",
          "/es/connexion",
          "/es/inscription",
          "/es/admin",
          "/es/equipe",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
