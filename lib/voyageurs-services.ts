import type { IconName } from "@/components/icons/ServiceIcons";

export const voyageursServices = [
  { slug: "transport", icon: "voiture" as IconName, image: "/voyageurs/transport.jpg" },
  { slug: "petit-dejeuner", icon: "petit-dejeuner" as IconName, image: "/voyageurs/petit-dejeuner.jpg" },
  { slug: "linge", icon: "linge" as IconName, image: "/voyageurs/linge.jpg" },
  { slug: "courses", icon: "courses" as IconName, image: "/voyageurs/courses.jpg" },
  { slug: "activites-nautiques", icon: "nautique" as IconName, image: "/voyageurs/activites-nautiques.jpg" },
  { slug: "balades-equestres", icon: "equestre" as IconName, image: "/voyageurs/balades-equestres.jpg" },
  { slug: "randonnee", icon: "randonnee" as IconName, image: "/voyageurs/randonnee.jpg" },
  { slug: "equipement-nautique", icon: "equipement-nautique" as IconName, image: "/voyageurs/equipement-nautique.jpg" },
  { slug: "location-voiture-scooter", icon: "location-voiture-scooter" as IconName, image: "/voyageurs/location-voiture-scooter.jpg" },
] as const;
