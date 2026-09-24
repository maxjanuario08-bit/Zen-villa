const Compte = {
  loginTitle: "Espacio miembro",
  loginMeta: "Acceso propietarios – Zenvilla",
  loginLead:
    "Espacio para propietarios. Cree una cuenta: el alojamiento se vincula tras la validación de ZenVilla.",
  loginEmail: "Email",
  loginPassword: "Contraseña",
  loginSubmit: "Iniciar sesión",
  loginSending: "Conectando…",
  loginError: "Email o contraseña incorrectos.",
  loginUnavailable: "Acceso no disponible. Comprueba las variables de entorno locales.",
  loginNoAccount: "¿Aún no tiene cuenta?",
  signupTitle: "Crear una cuenta",
  signupMeta: "Registro propietarios – ZenVilla",
  signupLead:
    "Regístrese para seguir más adelante el calendario, la limpieza y los ingresos. El alojamiento solo aparece cuando nuestro equipo lo vincula.",
  signupName: "Nombre",
  signupConfirm: "Confirmar la contraseña",
  signupPasswordHint: "Mínimo 8 caracteres.",
  signupProperty: "Su vivienda (opcional)",
  signupPropertyPlaceholder: "Ej. Mini Villa Pinson, Santa Giulia",
  signupSubmit: "Crear mi cuenta",
  signupSending: "Creando…",
  signupError: "No se ha podido crear la cuenta. Revise los campos.",
  signupExists: "Ya existe una cuenta con este email. Inicie sesión.",
  signupWeak: "La contraseña debe tener al menos 8 caracteres.",
  signupHasAccount: "¿Ya está registrado?",
  logout: "Cerrar sesión",
  memberNav: "Espacio miembro",
  accountNav: "Mi cuenta",
  dashTitle: "Espacio miembro",
  dashHello: "Hola {name}",
  dashLead:
    "Sigue los alojamientos confiados a Zenvilla: calendario, limpieza, ingresos y facturación.",
  dashEmpty:
    "Su cuenta está creada. Aún no hay alojamiento vinculado: ZenVilla lo asociará tras validar su vivienda.",
  seeLogement: "Abrir el panel",
  yearRevenue: "Ingresos {year}",
  yearFee: "Factura Zenvilla {year}",
  nightsRented: "{count} noches alquiladas",
  backToDash: "Volver al espacio miembro",
  calTitle: "Calendario",
  calLead:
    "Las estancias pagadas están bloqueadas. Pulsa una noche libre para bloquearla, o una noche bloqueada por ti para liberarla.",
  calPrev: "Mes anterior",
  calNext: "Mes siguiente",
  legendAvailable: "Libre",
  legendRented: "Alquilado",
  legendOwner: "Bloqueado por ti",
  legendClosed: "Cerrado",
  calSaving: "Guardando…",
  calError: "No se ha podido cambiar esta fecha.",
  calRented: "Esta noche ya está alquilada.",
  stayGuest: "Estancia {guest}",
  cleaningTitle: "Historial de limpiezas",
  cleaningLead: "Tras la salida: hora, fotos y estado del inventario.",
  cleaningEmpty: "Aún no hay ninguna limpieza registrada.",
  cleaningBy: "Realizado por {name}",
  cleaningInventory: "Estado del inmueble",
  cleaningPhotos: "Fotos",
  photoOpen: "Ampliar foto",
  financeTitle: "Ingresos y facturación",
  financeLead:
    "Comisión Zenvilla: {pct} % de la facturación de alojamiento (noches cobradas), sin limpieza del viajero.",
  financeGross: "Facturación {year}",
  financeFee: "Facturado por Zenvilla",
  financeNet: "Neto propietario",
  financeNights: "{count} noches",
  financeStay: "{guest} · {from} → {to}",
  financeFeeLine: "Comisión {pct} %",
  guests: {
    martin: "Familia Martin",
    laurent: "Sophie Laurent",
    wright: "James Wright",
    rossi: "Familia Rossi",
  },
  cleaners: {
    marie: "Marie Costa",
    luca: "Luca Bianchi",
  },
  cleanings: {
    "clean-pinson-2026-04-15": {
      notes:
        "Sin incidencias tras la salida. Vajilla completa, ropa cambiada, terraza barrida. Llaves en la caja.",
    },
    "clean-pinson-2026-06-25": {
      notes:
        "Un vaso astillado sustituido. Salón y terraza en orden. Café y papel repuestos.",
    },
    "clean-pinson-2026-07-27": {
      notes:
        "Sin incidencias. Aire acondicionado desempolvado, ropa de cama premium. Exterior aclarado tras el mistral.",
    },
  },
} as const;

export default Compte;
