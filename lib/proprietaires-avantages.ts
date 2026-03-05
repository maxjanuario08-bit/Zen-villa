import type { IconName } from "@/components/icons/ServiceIcons";

export const proprietairesAvantages = [
  {
    slug: "gain-de-temps",
    titre: "Gain de temps",
    icon: "temps" as IconName,
    description: "Déléguez toute la gestion de votre villa : réservations, ménage, maintenance, accueil des voyageurs. Reposez-vous, nous nous occupons de tout.",
    details: [
      "Plus besoin de gérer les allers-retours",
      "Fini les soucis de coordination avec le ménage",
      "Calendrier et réservations gérés à votre place",
      "Un seul interlocuteur pour toutes les prestations",
    ],
  },
  {
    slug: "qualite-premium",
    titre: "Qualité premium",
    icon: "qualite" as IconName,
    description: "Des prestations haut de gamme pour préserver et valoriser votre bien de prestige. Nous traitons votre villa comme si c'était la nôtre.",
    details: [
      "Ménage soigné avec produits adaptés",
      "Linge de qualité professionnelle",
      "Partenaire de confiance pour la maintenance",
      "Standards hôteliers pour l'accueil des voyageurs",
    ],
  },
  {
    slug: "transparence-totale",
    titre: "Transparence totale",
    icon: "mobile" as IconName,
    description: "Suivez l'activité de votre villa en temps réel via notre application digitale dédiée. Visibilité complète sur les séjours et les prestations.",
    details: [
      "Application mobile dédiée aux propriétaires",
      "Suivi des arrivées et départs en direct",
      "Historique des prestations et interventions",
      "Tableau de bord avec indicateurs clés",
    ],
  },
  {
    slug: "assistance-7j7",
    titre: "Assistance 7j/7",
    icon: "assistance" as IconName,
    description: "Une équipe locale disponible tous les jours pour vos voyageurs et votre propriété. Réactivité et sérénité garanties.",
    details: [
      "Équipe basée en Corse Sud",
      "Réponse rapide aux voyageurs",
      "Gestion des imprévus et urgences",
      "Coordination avec vous en cas de besoin",
    ],
  },
  {
    slug: "entretien-maintenance",
    titre: "Entretien & maintenance",
    icon: "maintenance" as IconName,
    description: "Ménage professionnel, gestion du linge, maintenance préventive et curative. Votre villa reste impeccable et fonctionnelle.",
    details: [
      "Ménage complet entre chaque séjour",
      "Blanchisserie et repassage",
      "Maintenance préventive programmée",
      "Réseau d'artisans de confiance",
    ],
  },
  {
    slug: "optimisation-revenus",
    titre: "Optimisation des revenus",
    icon: "chart" as IconName,
    description: "Pack Premium : création d'annonces, photos pro, gestion des plateformes pour maximiser votre CA locatif. Nous mettons votre villa en valeur.",
    details: [
      "Shooting photo professionnel",
      "Rédaction et optimisation des annonces",
      "Gestion Airbnb, Booking, Abritel",
      "Stratégie tarifaire dynamique",
    ],
  },
] as const;
