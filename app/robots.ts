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
          "/en/compte",
          "/en/connexion",
          "/en/inscription",
          "/es/compte",
          "/es/connexion",
          "/es/inscription",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
