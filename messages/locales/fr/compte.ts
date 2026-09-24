const Compte = {
  loginTitle: "Espace membre",
  loginMeta: "Connexion propriétaires – Zenvilla",
  loginLead:
    "Espace réservé aux propriétaires. Créez un compte : votre logement sera associé après validation par Zenvilla.",
  loginEmail: "Email",
  loginPassword: "Mot de passe",
  loginSubmit: "Se connecter",
  loginSending: "Connexion…",
  loginError: "Email ou mot de passe incorrect.",
  loginUnavailable: "Connexion indisponible. Vérifiez les variables d’environnement locales.",
  loginNoAccount: "Pas encore de compte ?",
  signupTitle: "Créer un compte",
  signupMeta: "Inscription propriétaires – Zenvilla",
  signupLead:
    "Inscrivez-vous pour suivre plus tard votre calendrier, le ménage et vos revenus. Le logement n’apparaît qu’une fois validé par notre équipe.",
  signupName: "Nom",
  signupConfirm: "Confirmer le mot de passe",
  signupPasswordHint: "8 caractères minimum.",
  signupProperty: "Votre bien (optionnel)",
  signupPropertyPlaceholder: "Ex. Mini Villa Pinson, Santa Giulia",
  signupSubmit: "Créer mon compte",
  signupSending: "Création…",
  signupError: "Impossible de créer le compte. Vérifiez les champs.",
  signupExists: "Un compte existe déjà avec cet email. Connectez-vous.",
  signupWeak: "Le mot de passe doit contenir au moins 8 caractères.",
  signupHasAccount: "Déjà inscrit ?",
  logout: "Déconnexion",
  memberNav: "Espace membre",
  accountNav: "Mon compte",
  dashTitle: "Espace membre",
  dashHello: "Bonjour {name}",
  dashLead:
    "Suivez vos logements confiés à Zenvilla : calendrier, ménage, revenus et facturation.",
  dashEmpty:
    "Votre compte est créé. Aucun logement n’y est encore lié : Zenvilla l’associera après validation de votre bien.",
  seeLogement: "Ouvrir le tableau de bord",
  yearRevenue: "Revenus {year}",
  yearFee: "Facture Zenvilla {year}",
  nightsRented: "{count} nuits louées",
  backToDash: "Retour à l’espace membre",
  calTitle: "Calendrier",
  calLead:
    "Les séjours payés sont figés. Cliquez une nuit libre pour la bloquer, une nuit bloquée par vous pour la libérer.",
  calPrev: "Mois précédent",
  calNext: "Mois suivant",
  legendAvailable: "Libre",
  legendRented: "Loué",
  legendOwner: "Bloqué par vous",
  legendClosed: "Fermé",
  calSaving: "Enregistrement…",
  calError: "Impossible de modifier cette date.",
  calRented: "Cette nuit est déjà louée.",
  stayGuest: "Séjour {guest}",
  cleaningTitle: "Historique des ménages",
  cleaningLead: "Interventions après départ : horaires, photos et état des lieux.",
  cleaningEmpty: "Aucun ménage n’est encore enregistré.",
  cleaningBy: "Réalisé par {name}",
  cleaningInventory: "État des lieux",
  cleaningPhotos: "Photos",
  photoOpen: "Agrandir la photo",
  financeTitle: "Revenus et facturation",
  financeLead:
    "Commission Zenvilla : {pct} % du chiffre d’affaires locatif (nuits facturées), hors ménage voyageur.",
  financeGross: "CA locatif {year}",
  financeFee: "Facturé par Zenvilla",
  financeNet: "Net propriétaire",
  financeNights: "{count} nuits",
  financeStay: "{guest} · {from} → {to}",
  financeFeeLine: "Commission {pct} %",
  guests: {
    martin: "Famille Martin",
    laurent: "Sophie Laurent",
    wright: "James Wright",
    rossi: "Famille Rossi",
  },
  cleaners: {
    marie: "Marie Costa",
    luca: "Luca Bianchi",
  },
  cleanings: {
    "clean-pinson-2026-04-15": {
      notes:
        "RAS après le départ. Vaisselle complète, linge changé, terrasse balayée. Clés rendues au coffre.",
    },
    "clean-pinson-2026-06-25": {
      notes:
        "Un verre ébréché remplacé. Terrasse et salon remis en état. Consommables (café, papier) réapprovisionnés.",
    },
    "clean-pinson-2026-07-27": {
      notes:
        "RAS. Climatisation dépoussiérée, literie premium remise. Extérieur rincé après mistral.",
    },
  },
} as const;

export default Compte;
