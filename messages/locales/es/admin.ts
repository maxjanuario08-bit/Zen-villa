const Admin = {
  meta: "Administración Zenvilla",
  title: "Administración",
  lead: "Espacio del equipo Zenvilla: asocie un propietario con su villa.",
  deskLead: "Cada cuenta creada aparece aquí. Elija la villa y asóciela.",
  email: "Email",
  password: "Contraseña",
  submit: "Entrar",
  sending: "Conexión…",
  loginError: "Email o contraseña incorrectos.",
  loginLimited: "Demasiados intentos. Espere unos minutos e inténtelo de nuevo.",
  unavailable:
    "La administración aún no está configurada. Añada OWNER_ADMIN_PASSWORD (mín. 8 caracteres) en Vercel y vuelva a desplegar.",
  logout: "Cerrar sesión",
  loading: "Carga de las cuentas…",
  empty: "Todavía no hay propietarios inscritos.",
  note: "Vivienda indicada",
  noVilla: "Ninguna villa asociada",
  chooseVilla: "Elegir una villa",
  link: "Asociar",
  linking: "Asociación…",
  unlink: "Quitar",
  actionError: "No se ha podido guardar. Inténtelo de nuevo.",
} as const;

export default Admin;
