const Admin = {
  meta: "Zenvilla admin",
  title: "Admin",
  lead: "Zenvilla team only: link an owner account to a home.",
  deskLead: "New accounts show up here. Pick the villa, then link it.",
  email: "Email",
  password: "Password",
  submit: "Sign in",
  sending: "Signing in…",
  loginError: "Incorrect email or password.",
  loginLimited: "Too many attempts. Wait a few minutes, then try again.",
  unavailable:
    "Admin is not configured yet. Add OWNER_ADMIN_PASSWORD (min. 8 characters) in Vercel, then redeploy.",
  logout: "Sign out",
  loading: "Loading accounts…",
  empty: "No owners have signed up yet.",
  note: "Property note",
  noVilla: "No home linked",
  chooseVilla: "Choose a home",
  link: "Link",
  linking: "Linking…",
  unlink: "Remove",
  actionError: "Could not save. Try again.",
  opsTitle: "Check-in, check-out and cleaning",
  opsLead: "Record who did arrival, departure and cleaning here — not in the owner space.",
} as const;

export default Admin;
