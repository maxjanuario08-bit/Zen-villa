/** Données fixes du livret Mini Villa Pinson (Santa Giulia) */
export const VILLA_PINSON = {
  slug: "mini-villa-pinson",
  onSiteContact: {
    name: "Michel",
    phone: "06 84 26 44 84",
    tel: "+33684264484",
  },
} as const;

export type LivretPlaceKey =
  | "palombaggia"
  | "rondinara"
  | "portoVecchio"
  | "bonifacio"
  | "lavezzi"
  | "piscines"
  | "bavella"
  | "coscione";

export const livretPlaces: readonly {
  key: LivretPlaceKey;
  image: string;
  boat?: boolean;
}[] = [
  { key: "palombaggia", image: "/hero-baie.png" },
  { key: "rondinara", image: "/hero-cote.png" },
  { key: "portoVecchio", image: "/hero-eau.png" },
  { key: "bonifacio", image: "/hero-packs.png" },
  { key: "lavezzi", image: "/hero-baie.png", boat: true },
  { key: "piscines", image: "/hero-cote.png" },
  { key: "bavella", image: "/hero-packs.png" },
  { key: "coscione", image: "/hero-eau.png" },
];

export type LivretActivityKey =
  | "santaGiulia"
  | "nautique"
  | "bateau"
  | "plongee"
  | "cheval"
  | "randonnee"
  | "location"
  | "transfert";

export const livretActivities: readonly {
  key: LivretActivityKey;
  href: string;
}[] = [
  { key: "santaGiulia", href: "/voyageurs/equipement-nautique" },
  { key: "nautique", href: "/voyageurs/activites-nautiques" },
  { key: "bateau", href: "/voyageurs/activites-nautiques" },
  { key: "plongee", href: "/voyageurs/activites-nautiques" },
  { key: "cheval", href: "/voyageurs/balades-equestres" },
  { key: "randonnee", href: "/voyageurs/randonnee" },
  { key: "location", href: "/voyageurs/location-voiture-scooter" },
  { key: "transfert", href: "/voyageurs/transport" },
];

export const livretAmenityKeys = [
  "coffee",
  "juicer",
  "microwave",
  "fridge",
  "towels",
  "shower",
  "hairdryer",
  "tv",
  "washing",
  "iron",
  "cleaningProducts",
  "terraceCoffee",
  "ac",
  "heating",
  "beach",
  "kayak",
  "snorkel",
  "noSmoking",
] as const;
