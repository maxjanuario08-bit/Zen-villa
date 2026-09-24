/** Redirige vers www en production pour que le cookie de session soit posé sur le bon hôte. */
export function afterAuthUrl(path: string) {
  if (typeof window === "undefined") return path;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return path;
  return `https://www.zen-villa.fr${path.startsWith("/") ? path : `/${path}`}`;
}
