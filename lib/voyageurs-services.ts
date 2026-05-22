import type { IconName } from "@/components/icons/ServiceIcons";

export const voyageursServices = [
  { slug: "transport", icon: "voiture" as IconName },
  { slug: "petit-dejeuner", icon: "petit-dejeuner" as IconName },
  { slug: "linge", icon: "linge" as IconName },
  { slug: "courses", icon: "courses" as IconName },
  { slug: "activites-nautiques", icon: "nautique" as IconName },
  { slug: "balades-equestres", icon: "equestre" as IconName },
  { slug: "randonnee", icon: "randonnee" as IconName },
  { slug: "equipement-nautique", icon: "equipement-nautique" as IconName },
  { slug: "location-voiture-scooter", icon: "location-voiture-scooter" as IconName },
] as const;
