import { CONTACT } from "@/lib/constants";
import { getLogement } from "@/lib/logements";
import { sendMail } from "@/lib/mail";
import { listOwnerAccountsForSlug } from "@/lib/owner-accounts";
import type { PendingBooking } from "@/lib/owner-types";

const SITE = "https://www.zen-villa.fr";

function villaLabel(slug: string) {
  const logement = getLogement(slug);
  if (logement?.copyKey === "pinson") return "Mini Villa Pinson";
  return slug;
}

function euro(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function livretUrl(slug: string) {
  return `${SITE}/livret/${slug}`;
}

async function ownerEmails(slug: string) {
  const owners = await listOwnerAccountsForSlug(slug);
  return owners
    .map((owner) => owner.email.trim().toLowerCase())
    .filter((email) => email.includes("@") && email !== CONTACT.email);
}

export async function notifyBookingConfirmed(booking: PendingBooking) {
  try {
    const villa = villaLabel(booking.slug);
    const livret = livretUrl(booking.slug);
    const stay = `${booking.checkIn} → ${booking.checkOut}`;
    const amount = euro(booking.amount);

    if (booking.guestEmail.includes("@")) {
      await sendMail({
        to: booking.guestEmail,
        subject: `Réservation confirmée – ${villa}`,
        text: [
          `Bonjour ${booking.guestLabel},`,
          ``,
          `Votre séjour à ${villa} est confirmé et payé.`,
          `Dates : ${stay}`,
          `Voyageurs : ${booking.guests}`,
          `Montant réglé : ${amount}`,
          ``,
          `Arrivée à partir de 15h. Départ au plus tard à 11h.`,
          `Livret d’accueil (wifi, accès, infos) : ${livret}`,
          ``,
          `Une question : ${CONTACT.telephone} ou ${CONTACT.email}`,
          `WhatsApp : https://wa.me/33686401316`,
          ``,
          `À bientôt,`,
          `Zenvilla`,
        ].join("\n"),
      });
    }

    const admin = [
      `Nouvelle réservation payée.`,
      ``,
      `Villa : ${villa}`,
      `Voyageur : ${booking.guestLabel}`,
      `Email : ${booking.guestEmail}`,
      `Téléphone : ${booking.guestPhone}`,
      `Dates : ${stay}`,
      `Voyageurs : ${booking.guests}`,
      `Montant : ${amount}`,
      `Livret : ${livret}`,
    ].join("\n");

    await sendMail({
      to: CONTACT.email,
      replyTo: booking.guestEmail,
      subject: `Réservation payée – ${villa} – ${booking.guestLabel}`,
      text: admin,
    });

    const owners = await ownerEmails(booking.slug);
    await Promise.all(
      owners.map((email) =>
        sendMail({
          to: email,
          subject: `Nouvelle réservation – ${villa}`,
          text: [
            `Bonjour,`,
            ``,
            `Une réservation a été payée pour ${villa}.`,
            `Voyageur : ${booking.guestLabel}`,
            `Dates : ${stay}`,
            `Voyageurs : ${booking.guests}`,
            `Montant : ${amount}`,
            ``,
            `Espace membre : ${SITE}/compte`,
            ``,
            `Zenvilla`,
          ].join("\n"),
        }),
      ),
    );
  } catch (err) {
    console.error("site-mail réservation", err);
  }
}

export async function notifyContactMessage(input: {
  nom: string;
  email: string;
  telephone: string;
  ville?: string;
  type?: string;
  message: string;
}) {
  const text = [
    `Nouveau message depuis le site.`,
    ``,
    `Nom : ${input.nom}`,
    `Email : ${input.email}`,
    `Téléphone : ${input.telephone}`,
    input.ville ? `Ville : ${input.ville}` : null,
    input.type ? `Type : ${input.type}` : null,
    ``,
    input.message,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  await sendMail({
    to: CONTACT.email,
    replyTo: input.email,
    subject: `Contact – ${input.nom}`,
    text,
  });
  await sendMail({
    to: input.email,
    subject: `Nous avons bien reçu votre message – Zenvilla`,
    text: [
      `Bonjour ${input.nom},`,
      ``,
      `Merci pour votre message. Nous vous répondons dès que possible.`,
      ``,
      `Zenvilla`,
      `${CONTACT.telephone}`,
      `${CONTACT.email}`,
    ].join("\n"),
  });
}

export async function notifyServiceRequest(input: {
  nom: string;
  email: string;
  telephone: string;
  prestation?: string;
  lieu?: string;
  dates?: string;
  message?: string;
}) {
  const label = input.prestation?.trim() || "Prestation";
  await sendMail({
    to: CONTACT.email,
    replyTo: input.email,
    subject: `Demande – ${label} – ${input.nom}`,
    text: [
      `Nouvelle demande de prestation.`,
      ``,
      `Prestation : ${label}`,
      `Nom : ${input.nom}`,
      `Email : ${input.email}`,
      `Téléphone : ${input.telephone}`,
      `Lieu : ${input.lieu || "—"}`,
      `Dates : ${input.dates || "—"}`,
      ``,
      input.message || "—",
    ].join("\n"),
  });
  await sendMail({
    to: input.email,
    subject: `Demande bien reçue – ${label}`,
    text: [
      `Bonjour ${input.nom},`,
      ``,
      `Nous avons bien reçu votre demande${input.prestation ? ` (${label})` : ""}.`,
      `Nous vous recontactons pour la confirmer.`,
      ``,
      `Zenvilla`,
      `${CONTACT.telephone}`,
    ].join("\n"),
  });
}
