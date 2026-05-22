import type { IconName } from "@/components/icons/ServiceIcons";

/** Métadonnées des services propriétaires (textes dans les fichiers messages) */
export const homeServices = [
  { slug: "check-in", icon: "check-in" as IconName },
  { slug: "menage", icon: "menage" as IconName },
  { slug: "reservations", icon: "reservations" as IconName },
  { slug: "maintenance", icon: "maintenance" as IconName },
  { slug: "activites", icon: "activites" as IconName },
  { slug: "assistance", icon: "assistance" as IconName },
] as const;

export type HomeServiceSlug = (typeof homeServices)[number]["slug"];
