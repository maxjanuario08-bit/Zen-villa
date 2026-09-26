import { getLogement } from "@/lib/logements";
import { sendMail } from "@/lib/mail";
import { listOwnerAccountsForSlug } from "@/lib/owner-accounts";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

function villaLabel(slug: string) {
  const logement = getLogement(slug);
  if (logement?.copyKey === "pinson") return "Mini Villa Pinson";
  return slug;
}

function sendEmail(to: string, subject: string, text: string) {
  return sendMail({ to, subject, text });
}

async function recipients(slug: string) {
  const owners = await listOwnerAccountsForSlug(slug);
  return owners
    .map((owner) => owner.email.trim().toLowerCase())
    .filter((email) => email.includes("@") && !email.endsWith("@localhost"));
}

export async function notifyOwnersCheckIn(stay: PaidStay) {
  try {
    const emails = await recipients(stay.slug);
    if (!emails.length) return;
    const villa = villaLabel(stay.slug);
    const guest = stay.guestLabel || stay.guestKey;
    const subject = `Check-in effectué – ${villa}`;
    const text = [
      `Bonjour,`,
      ``,
      `Le check-in a été enregistré pour ${villa}.`,
      `Voyageur : ${guest}`,
      `Séjour : ${stay.checkIn} → ${stay.checkOut}`,
      stay.checkInTime ? `Heure : ${stay.checkInTime}` : null,
      stay.checkedInBy ? `Effectué par : ${stay.checkedInBy}` : null,
      ``,
      `Vous pouvez suivre le séjour dans votre espace membre : https://www.zen-villa.fr/compte`,
      ``,
      `Zenvilla`,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
    await Promise.all(emails.map((email) => sendEmail(email, subject, text)));
  } catch (err) {
    console.error("owner-notify check-in", err);
  }
}

export async function notifyOwnersCleaning(stay: PaidStay | null, cleaning: CleaningRecord) {
  try {
    const emails = await recipients(cleaning.slug);
    if (!emails.length) return;
    const villa = villaLabel(cleaning.slug);
    const guest = stay?.guestLabel || stay?.guestKey || "";
    const subject = `Ménage effectué – ${villa}`;
    const text = [
      `Bonjour,`,
      ``,
      `Le ménage a été enregistré pour ${villa}.`,
      guest ? `Séjour : ${guest} (${stay?.checkIn} → ${stay?.checkOut})` : null,
      `Date : ${cleaning.date}${cleaning.time ? ` à ${cleaning.time}` : ""}`,
      cleaning.cleanerId ? `Effectué par : ${cleaning.cleanerId}` : null,
      ``,
      `Vous pouvez suivre le séjour dans votre espace membre : https://www.zen-villa.fr/compte`,
      ``,
      `Zenvilla`,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
    await Promise.all(emails.map((email) => sendEmail(email, subject, text)));
  } catch (err) {
    console.error("owner-notify ménage", err);
  }
}
