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
          "/en/compte",
          "/en/connexion",
          "/en/inscription",
          "/en/admin",
          "/es/compte",
          "/es/connexion",
          "/es/inscription",
          "/es/admin",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
