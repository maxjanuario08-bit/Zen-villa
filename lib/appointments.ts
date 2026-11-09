/** Public booking links only. Never expose a private calendar or accept arbitrary embeds. */
export function googleAppointmentUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (url.hostname === "calendar.app.google" && url.pathname.length > 1) return url.href;
    if (url.hostname === "calendar.google.com" && /\/appointments\/schedules\/[\w-]+/.test(url.pathname)) return url.href;
  } catch { /* Invalid or incomplete booking URL. */ }
  return null;
}
const DEFAULT_APPOINTMENT_URL = "https://calendar.app.google/qPt4zxxzPdqE9mMV7";
export const APPOINTMENT_URL = googleAppointmentUrl(process.env.NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL)
  ?? DEFAULT_APPOINTMENT_URL;
