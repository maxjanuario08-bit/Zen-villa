import type { IconName } from "@/components/icons/ServiceIcons";

export const voyageursServices = [
  { slug: "transport", icon: "voiture" as IconName, image: "/voyageurs/generated/transport.jpg" },
  { slug: "petit-dejeuner", icon: "petit-dejeuner" as IconName, image: "/voyageurs/generated/petit-dejeuner.jpg" },
  { slug: "linge", icon: "linge" as IconName, image: "/voyageurs/generated/linge.jpg" },
  { slug: "courses", icon: "courses" as IconName, image: "/voyageurs/generated/courses.jpg" },
  { slug: "activites-nautiques", icon: "nautique" as IconName, image: "/voyageurs/generated/activites-nautiques.jpg" },
  { slug: "balades-equestres", icon: "equestre" as IconName, image: "/voyageurs/generated/balades-equestres.jpg" },
  { slug: "randonnee", icon: "randonnee" as IconName, image: "/voyageurs/generated/randonnee.jpg" },
  { slug: "equipement-nautique", icon: "equipement-nautique" as IconName, image: "/voyageurs/generated/equipement-nautique.jpg" },
  { slug: "location-voiture-scooter", icon: "location-voiture-scooter" as IconName, image: "/voyageurs/generated/location-voiture-scooter.jpg" },
] as const;
