import type { BookingConfig } from "@/lib/booking";

export type Logement = {
  slug: string;
  copyKey: string;
  image: string;
  images?: readonly string[];
  forRent: boolean;
  managed: boolean;
  guests: number;
  bedrooms: number;
  interiorM2?: number;
  terraceM2?: number;
  booking?: BookingConfig;
};

export const logements = [
  {
    slug: "mini-villa-pinson",
    copyKey: "pinson",
    image: "/logements/pinson/exterieur.jpg",
    images: [
      "/logements/pinson/exterieur.jpg",
      "/logements/pinson/entree.jpg",
      "/logements/pinson/cuisine.jpg",
      "/logements/pinson/cuisine-2.jpg",
      "/logements/pinson/sejour.jpg",
      "/logements/pinson/sejour-haut.jpg",
      "/logements/pinson/chambre.jpg",
      "/logements/pinson/chambre-2.jpg",
      "/logements/pinson/terrasse.jpg",
      "/logements/pinson/terrasse-bbq.jpg",
      "/logements/pinson/terrasse-vue.jpg",
      "/logements/pinson/toilettes.jpg",
      "/logements/pinson/sdb.jpg",
    ],
    forRent: true,
    managed: true,
    guests: 4,
    bedrooms: 1,
    interiorM2: 31.41,
    terraceM2: 20,
    booking: {
      enabled: true,
      currency: "EUR",
      minNights: 2,
      minNightsByMonth: { 3: 5, 4: 5 },
      paypalEnabled: true,
      cleaningFee: 0,
      defaultNightly: 80,
      seasons: [
        { from: "03-01", to: "03-31", nightly: 80 },
        { from: "04-01", to: "04-30", nightly: 90 },
        { from: "05-01", to: "05-31", nightly: 100 },
        { from: "06-01", to: "06-15", nightly: 150 },
        { from: "06-16", to: "06-30", nightly: 170 },
        { from: "07-01", to: "07-14", nightly: 200 },
        { from: "07-15", to: "08-15", nightly: 230 },
        { from: "08-16", to: "08-31", nightly: 190 },
        { from: "09-01", to: "09-15", nightly: 150 },
        { from: "09-16", to: "09-30", nightly: 110 },
        { from: "10-01", to: "10-31", nightly: 100 },
      ],
      blocked: [],
      closedMmdd: { from: "11-02", to: "03-03" },
    },
  },
] as const satisfies readonly Logement[];

export type LogementSlug = (typeof logements)[number]["slug"];

export function getLogement(slug: string) {
  return logements.find((l) => l.slug === slug);
}

export const logementsForRent = logements.filter((l) => l.forRent);
export const logementsManaged = logements.filter((l) => l.managed);
