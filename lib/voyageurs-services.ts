import type { IconName } from "@/components/icons/ServiceIcons";

export const voyageursServices = [
  {
    slug: "transport",
    label: "Service de transport",
    icon: "voiture" as IconName,
    description: "Besoin d'un transfert aéroport, gare ou port vers votre villa ? Notre service de transport vous accompagne en toute sérénité à travers la Corse du Sud.",
    details: [
      "Transfert aéroport (Figari, Ajaccio) vers votre villa",
      "Transfert gare ou port",
      "Courses et excursions sur demande",
      "Véhicule confortable et climatisé",
    ],
  },
  {
    slug: "petit-dejeuner",
    label: "Service petit-déjeuner",
    icon: "petit-dejeuner" as IconName,
    description: "Commencez chaque matin du bon pied avec un petit-déjeuner livré à votre villa. Produits frais, locaux et de qualité pour un réveil en douceur.",
    details: [
      "Livraison à l'heure de votre choix",
      "Viennoiseries, pains frais, confitures",
      "Jus de fruits, café, thé",
      "Option produits locaux corses",
    ],
  },
  {
    slug: "linge",
    label: "Service linge",
    icon: "linge" as IconName,
    description: "Profitez de votre séjour sans vous soucier du linge. Nous prenons en charge le lavage, le séchage et le repassage de vos vêtements.",
    details: [
      "Blanchisserie complète",
      "Retrait et livraison à la villa",
      "Linge de maison inclus (draps, serviettes)",
      "Service express sur demande",
    ],
  },
  {
    slug: "courses",
    label: "Livraison des courses",
    icon: "courses" as IconName,
    description: "Votre garde-manger rempli avant votre arrivée ou sur demande pendant le séjour. Course à la carte ou liste personnalisée.",
    details: [
      "Courses d'accueil (premiers repas)",
      "Livraison à la demande pendant le séjour",
      "Produits frais, boissons, produits d'entretien",
      "Préparation du réfrigérateur avant arrivée",
    ],
  },
  {
    slug: "activites-nautiques",
    label: "Activités nautiques",
    icon: "nautique" as IconName,
    description: "Découvrez la mer turquoise de la Corse : sorties en bateau, snorkeling, locations de Jet-Ski. Nous organisons vos activités nautiques sur mesure.",
    details: [
      "Location de bateaux et semi-rigides",
      "Sorties snorkeling et plongée",
      "Jet-Ski, paddle, kayak",
      "Excursions vers les calanques et criques",
    ],
  },
  {
    slug: "balades-equestres",
    label: "Balades équestres",
    icon: "equestre" as IconName,
    description: "Explorez les sentiers corses à cheval. Des balades adaptées à tous les niveaux, de la promenade en bord de mer aux randonnées en montagne.",
    details: [
      "Balades d'1h à la demi-journée",
      "Tous niveaux (débutants à cavaliers confirmés)",
      "Chevaux bien dressés et équipement fourni",
      "Circuits en bord de mer ou dans les maquis",
    ],
  },
  {
    slug: "randonnee",
    label: "Visite et randonnée",
    icon: "randonnee" as IconName,
    description: "Partez à la découverte des sentiers de randonnée corses. Nous vous conseillons et organisons vos sorties selon votre forme et vos envies.",
    details: [
      "Conseils et cartes des sentiers",
      "Randonnées guidées sur demande",
      "Préparation des pique-niques",
      "Trails côtiers, maquis et montagne",
    ],
  },
  {
    slug: "equipement-nautique",
    label: "Location équipement nautique",
    icon: "equipement-nautique" as IconName,
    description: "Paddle, kayak, masques, palmes... Tout l'équipement nautique dont vous avez besoin pour profiter de la mer. Location à la demi-journée ou à la journée, livraison à votre villa.",
    details: [
      "Paddles gonflables ou rigides",
      "Kayaks, masques et palmes",
      "Livraison et récupération à la villa",
      "Gilets de sauvetage fournis",
    ],
  },
  {
    slug: "location-voiture-scooter",
    label: "Location voiture et scooter",
    icon: "location-voiture-scooter" as IconName,
    description: "Voiture ou scooter : choisissez votre moyen de transport pour explorer la côte corse en toute liberté. Livraison à votre villa, assurance incluse.",
    details: [
      "Voitures et scooters 50cc / 125cc",
      "Livraison à la villa",
      "Casques et équipement fournis",
      "Assurance incluse",
    ],
  },
] as const;
