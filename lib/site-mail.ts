import { bookingConfirmationEmail } from "@/lib/booking-confirmation-email";
import { createHash } from "crypto";
import { pg, usePostgres as bookingUsesPostgres } from "@/lib/owner-pg";
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

async function ownerEmails(slug: string) {
  const owners = await listOwnerAccountsForSlug(slug);
  return owners
    .map((owner) => owner.email.trim().toLowerCase())
    .filter((email) => email.includes("@") && email !== CONTACT.email);
}

/** Each recipient is durably acknowledged; a retried PayPal IPN retries only failed emails. */
export async function notifyBookingConfirmed(booking: PendingBooking): Promise<boolean> {
  const villa=villaLabel(booking.slug), stay=`${booking.checkIn} → ${booking.checkOut}`;
  const common=[`Villa : ${villa}`,`Voyageur : ${booking.guestLabel}`,`Dates : ${stay}`,`Voyageurs : ${booking.guests}`,`Montant réglé : ${euro(booking.amount)}`];
  try {
    const owners=await ownerEmails(booking.slug);
    const messages=[
      ...(booking.guestEmail.includes("@")?[{to:booking.guestEmail,...bookingConfirmationEmail(booking,getLogement(booking.slug))}]:[]),
      {to:CONTACT.email,subject:`Réservation payée – ${villa} – ${booking.guestLabel}`,text:[`Nouvelle réservation payée.`,...common,`Email : ${booking.guestEmail}`,`Téléphone : ${booking.guestPhone}`,`Planning : ${SITE}/admin`].join("\n")},
      ...owners.map(to=>({to,subject:`Nouvelle réservation – ${villa}`,text:[`Bonjour,`,`Une réservation a été payée pour votre logement. Les dates sont bloquées dans votre agenda.`,...common,`Espace membre : ${SITE}/compte`,`Zenvilla`].join("\n\n")}))
    ];
    const results=await Promise.allSettled(messages.map(async(message)=>{
      const id=createHash("sha256").update(`${booking.id}:${message.to.toLowerCase()}:${message.subject}`).digest("hex");
      const sql=bookingUsesPostgres()?await pg():null;
      if(sql && (await sql`SELECT id FROM booking_mail_deliveries WHERE id=${id}`).length)return true;
      const sent=await sendMail({...message,idempotencyKey:`booking-${id}`});
      if(sent!==true)return false;
      if(sql)await sql`INSERT INTO booking_mail_deliveries(id) VALUES(${id}) ON CONFLICT DO NOTHING`;
      return true;
    }));
    return results.every(r=>r.status==='fulfilled' && r.value===true);
  } catch {
    console.error("site-mail: booking notification failed",{bookingId:booking.id});
    return false;
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
