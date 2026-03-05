import type { IconName } from "@/components/icons/ServiceIcons";

export const homeServices = [
  {
    slug: "check-in",
    label: "Accueil check in/out",
    icon: "check-in" as IconName,
    description: "Accueil personnalisé de vos voyageurs à leur arrivée et accompagnement lors de leur départ. Nous assurons la remise des clés, la visite des lieux et les consignes de la villa.",
    details: [
      "Remise des clés à l'arrivée",
      "Visite de la villa et explication des équipements",
      "Check-out et état des lieux de sortie",
      "Transmission des informations aux propriétaires",
    ],
  },
  {
    slug: "menage",
    label: "Ménage professionnel",
    icon: "menage" as IconName,
    description: "Un ménage soigné après chaque séjour pour préserver votre villa. Équipe professionnelle, produits de qualité et linge de maison géré.",
    details: [
      "Ménage complet entre chaque location",
      "Changement des draps et serviettes",
      "Produits d'entretien adaptés aux matériaux nobles",
      "Contrôle qualité systématique",
    ],
  },
  {
    slug: "reservations",
    label: "Gestion des réservations",
    icon: "reservations" as IconName,
    description: "Gestion complète de votre calendrier et de vos réservations sur Airbnb, Booking, Abritel et autres plateformes. Réponses aux voyageurs 7j/7.",
    details: [
      "Synchronisation des calendriers",
      "Gestion des demandes et confirmations",
      "Réponses aux voyageurs dans les délais",
      "Optimisation des tarifs selon la saison",
    ],
  },
  {
    slug: "maintenance",
    label: "Maintenance des villas",
    icon: "maintenance" as IconName,
    description: "Entretien préventif et dépannage rapide pour maintenir votre villa en parfait état. Réseau d'artisans de confiance en Corse Sud.",
    details: [
      "Interventions préventives programmées",
      "Dépannage urgence (plomberie, électricité, climatisation)",
      "Réseau d'artisans qualifiés",
      "Suivi et traçabilité des interventions",
    ],
  },
  {
    slug: "activites",
    label: "Services et activités",
    icon: "activites" as IconName,
    description: "Proposition et organisation d'activités pour les voyageurs : sorties en mer, balades à cheval, livraison de courses, location de matériel.",
    details: [
      "Conseil et réservation d'activités",
      "Livraison petit-déjeuner, courses",
      "Location équipement nautique, voiture, scooter, bateau",
      "Partenariats avec les prestataires locaux",
    ],
  },
  {
    slug: "assistance",
    label: "Assistance 7/7j",
    icon: "assistance" as IconName,
    description: "Une équipe locale disponible tous les jours pour vos voyageurs et pour vous. Joignables par téléphone pour toute question ou urgence.",
    details: [
      "Disponibilité 7 jours sur 7",
      "Numéro unique pour voyageurs et propriétaires",
      "Intervention rapide en cas d'urgence",
      "Interface digitale pour le suivi en temps réel",
    ],
  },
] as const;
