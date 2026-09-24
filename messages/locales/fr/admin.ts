const Admin = {
  meta: "Administration Zenvilla",
  title: "Administration",
  lead: "Espace réservé à l’équipe Zenvilla : associez un propriétaire à sa villa.",
  deskLead: "Chaque compte créé apparaît ici. Choisissez la villa, puis associez.",
  email: "Email",
  password: "Mot de passe",
  submit: "Entrer",
  sending: "Connexion…",
  loginError: "Email ou mot de passe incorrect.",
  unavailable:
    "L’admin n’est pas encore configuré. Ajoutez OWNER_ADMIN_PASSWORD (8 caractères min.) dans Vercel, puis redéployez.",
  logout: "Déconnexion",
  loading: "Chargement des comptes…",
  empty: "Aucun propriétaire inscrit pour le moment.",
  note: "Bien indiqué",
  noVilla: "Aucune villa liée",
  chooseVilla: "Choisir une villa",
  link: "Associer",
  linking: "Association…",
  unlink: "Retirer",
  actionError: "Impossible d’enregistrer. Réessayez.",
} as const;

export default Admin;
