const Equipe = {
  meta: "Zenvilla staff",
  title: "Staff space",
  lead: "Check-in, check-out and cleaning access. Credentials come from Zenvilla.",
  deskLead: "Pick a home, then record arrivals, departures and cleaning.",
  email: "Email",
  password: "Password",
  submit: "Sign in",
  sending: "Signing in…",
  loginError: "Incorrect email or password.",
  loginLimited: "Too many attempts. Wait a few minutes, then try again.",
  unavailable:
    "Staff access is not configured yet. Add STAFF_EMAIL and STAFF_PASSWORD in Vercel, then redeploy.",
  logout: "Sign out",
  chooseVilla: "Home",
  loadError: "Could not load this home.",
} as const;

export default Equipe;
