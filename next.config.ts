import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/combien-peut-rapporter-villa",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/proprietaires/optimisation-revenus",
        destination: "/proprietaires/mise-en-valeur-annonces",
        permanent: true,
      },
      {
        source: "/proprietaires/qualite-premium",
        destination: "/proprietaires/qualite-excellente",
        permanent: true,
      },
      {
        source: "/en/proprietaires/qualite-premium",
        destination: "/en/proprietaires/qualite-excellente",
        permanent: true,
      },
      {
        source: "/es/proprietaires/qualite-premium",
        destination: "/es/proprietaires/qualite-excellente",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
