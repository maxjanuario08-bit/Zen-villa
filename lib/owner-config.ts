export function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function databaseUrl() {
  return (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || "").trim();
}

export function ownerDemoEnabled() {
  if (process.env.OWNER_SEED_DEMO === "true") return true;
  if (process.env.OWNER_SEED_DEMO === "false") return false;
  return !isProductionRuntime();
}

export function ownerSessionSecret() {
  const fromEnv = process.env.OWNER_SESSION_SECRET?.trim() ?? "";
  const weak = !fromEnv || fromEnv === "change-me-locally" || fromEnv.length < 32;
  if (!weak) return fromEnv;
  if (!isProductionRuntime()) return fromEnv || "zenvilla-local-dev-secret";
  return "";
}

export function ownerAdminSecret() {
  return process.env.OWNER_ADMIN_SECRET?.trim() ?? "";
}

export function ownerAdminEmail() {
  const fromEnv = process.env.OWNER_ADMIN_EMAIL?.trim().toLowerCase();
  return fromEnv || "contact@zen-villa.fr";
}

export function ownerAdminPassword() {
  const fromEnv = process.env.OWNER_ADMIN_PASSWORD?.trim() ?? "";
  if (fromEnv.length >= 8) return fromEnv;
  if (!isProductionRuntime()) return fromEnv || "zenvilla-admin-local";
  return "";
}

/** En production Vercel, une base Postgres est obligatoire (le disque est éphémère). */
export function ownerStoreReady() {
  if (!isProductionRuntime()) return true;
  return Boolean(databaseUrl());
}
