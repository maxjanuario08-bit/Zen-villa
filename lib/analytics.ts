export const GOOGLE_ANALYTICS_ID = "G-0EWN4TFMJ2";
export const COOKIE_CONSENT_KEY = "zenvilla-cookie-consent";

export function analyticsPublicPath(pathname: string) {
  const path = pathname.replace(/^\/(en|es|fr)(?=\/|$)/, "") || "/";
  return !/^\/(admin|compte|equipe|connexion|inscription|mot-de-passe-oublie|reinitialiser-mot-de-passe)(\/|$)/.test(path);
}
