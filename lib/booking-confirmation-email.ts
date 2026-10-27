import { CONTACT, SITE } from "@/lib/constants";
import type { Logement } from "@/lib/logements";
import type { PendingBooking } from "@/lib/owner-types";

const brown = "#665447";
const ink = "#414b57";
const card = "#f7f5f2";
function escape(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]!);
}
function dateLabel(iso: string) {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid booking date");
  return new Intl.DateTimeFormat("fr-FR", {day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Paris"}).format(date);
}
function assetUrl(path: string) {
  const url = new URL(path, SITE.url);
  // Property images and buttons use our own public assets, never arbitrary URLs.
  return url.origin === new URL(SITE.url).origin ? escape(url.href) : "";
}
function circle(icon: string) {
  return `<table role="presentation" width="46" height="46" style="width:46px;height:46px;border-radius:50%;background:#eee5d9;"><tr><td align="center" valign="middle"><img src="${assetUrl(`/mail/icons/${icon}.png`)}" alt="" width="25" height="25" style="width:25px;height:25px;border:0;"></td></tr></table>`;
}
function summaryCell(icon: string, label: string, value: string, last = false) {
  return `<td class="summary-cell" width="25%" valign="top" align="center" style="width:25%;padding:16px 8px;${last ? "" : "border-right:1px solid #dfd2c2;"}">${circle(icon)}<p style="font-size:10px;letter-spacing:2px;font-weight:bold;margin:9px 0 7px;">${label}</p><p style="font-size:13px;line-height:19px;margin:0;">${value}</p></td>`;
}

/** Guest confirmation based on the owner's supplied visual. Text fallback matches HTML. */
export function bookingConfirmationEmail(booking: PendingBooking, logement: Logement | undefined) {
  const name = logement?.confirmation?.name || booking.slug;
  const location = logement?.confirmation?.location || "";
  const stayPrefix = logement?.confirmation?.stayPrefix || "à";
  const arrival = logement?.confirmation?.arrivalTime;
  const departure = logement?.confirmation?.departureTime;
  const nights = Math.round((Date.parse(`${booking.checkOut}T12:00:00Z`) - Date.parse(`${booking.checkIn}T12:00:00Z`)) / 86400000);
  if (!Number.isFinite(nights) || nights < 1) throw new Error("Invalid booking interval");
  const from = dateLabel(booking.checkIn), to = dateLabel(booking.checkOut);
  const amount = new Intl.NumberFormat("fr-FR", {style:"currency",currency:"EUR",minimumFractionDigits:0,maximumFractionDigits:2}).format(booking.amount);
  const guests = `${booking.guests} voyageur${booking.guests > 1 ? "s" : ""}`;
  const duration = `${nights} nuit${nights > 1 ? "s" : ""}`;
  const livret = `${SITE.url}/livret/${encodeURIComponent(booking.slug)}`;
  const hero = assetUrl("/hero-baie.png");
  const image = logement?.image ? assetUrl(logement.image) : "";
  const arrivalText = arrival ? `À partir de ${arrival}` : "Horaire à convenir avec notre équipe";
  const departureText = departure ? `Au plus tard à ${departure}` : "Horaire à convenir avec notre équipe";
  const text = [
    "ZEN VILLA — CONCIERGERIE CORSE SUD", "Réservation confirmée", `Bonjour ${booking.guestLabel},`,
    `Votre séjour ${stayPrefix} ${name} est confirmé et payé.`,
    "Nous sommes ravis de vous accueillir et avons hâte de vous offrir une expérience inoubliable.",
    name, location, `Voir le livret d’accueil : ${livret}`,
    `DATES : du ${from} au ${to} (${duration})`, `VOYAGEURS : ${guests}`, `MONTANT RÉGLÉ : ${amount}`,
    "STATUT : Réservation confirmée et payée", `VOTRE ARRIVÉE : ${arrivalText}`, `VOTRE DÉPART : ${departureText}`,
    "UNE QUESTION ?", "Notre équipe reste à votre disposition pour toute demande avant ou pendant votre séjour.",
    CONTACT.telephone, CONTACT.email, "Nous répondons rapidement, 7j/7.", SITE.url,
  ].filter(Boolean).join("\n\n");
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Réservation confirmée</title>
<style>body{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block}a{color:inherit} @media only screen and (max-width:560px){.content{padding:24px 20px!important}.headline{font-size:36px!important}.property-image,.property-info,.contact-button,.time-cell{display:block!important;width:100%!important;box-sizing:border-box!important}.property-image img{width:100%!important;height:180px!important;object-fit:cover!important}.property-info{padding:18px 0 0!important}.summary-cell{display:inline-block!important;width:50%!important;box-sizing:border-box!important;border:0!important;vertical-align:top}.contact-button{margin-bottom:10px!important}.hero-title{font-size:64px!important}.time-cell{padding:12px!important;border:0!important}}</style></head>
<body style="background:#f1eeea;color:${ink};font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Votre séjour ${escape(stayPrefix)} ${escape(name)}, du ${escape(from)} au ${escape(to)}, est confirmé et payé.</div>
<table role="presentation" width="100%" style="background:#f1eeea;"><tr><td align="center">
<table role="presentation" width="680" style="width:100%;max-width:680px;background:#ffffff;">
<tr><td background="${hero}" bgcolor="#428b91" height="242" valign="bottom" style="height:242px;background-image:url('${hero}');background-position:center;background-size:cover;">
<!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px;height:242px;"><v:fill type="frame" src="${hero}" color="#428b91"/><v:textbox inset="0,0,0,0"><![endif]-->
<table role="presentation" width="100%"><tr><td style="padding:90px 38px 22px;"><div class="hero-title" style="font-family:Georgia,'Times New Roman',serif;font-size:78px;line-height:1;color:white;">zen villa</div><div style="font-size:13px;letter-spacing:3px;line-height:17px;color:white;margin-top:5px;">CONCIERGERIE<br>CORSE SUD</div></td></tr></table>
<!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
</td></tr>
<tr><td class="content" style="padding:24px 38px 10px;">
<h1 class="headline" style="font-family:Georgia,'Times New Roman',serif;font-size:47px;line-height:1.12;color:${brown};font-weight:normal;margin:0 0 16px;">Réservation confirmée</h1>
<div style="width:43px;height:3px;background:#cdbb9f;margin-bottom:16px;"></div>
<p style="font-size:16px;line-height:22px;margin:0 0 14px;">Bonjour ${escape(booking.guestLabel)},</p>
<p style="font-size:16px;line-height:22px;margin:0 0 22px;">Votre séjour ${escape(stayPrefix)} ${escape(name)} est confirmé et payé.<br>Nous sommes ravis de vous accueillir et avons hâte de vous offrir une expérience inoubliable.</p>
<table role="presentation" width="100%" style="background:${card};border-radius:10px;"><tr><td style="padding:12px 14px;">
<table role="presentation" width="100%"><tr>
${image ? `<td class="property-image" width="38%" valign="middle" style="width:38%;"><img src="${image}" alt="${escape(name)}" width="214" height="114" style="width:100%;height:114px;object-fit:cover;border-radius:7px;"></td>` : ""}
<td class="property-info" valign="middle" style="padding-left:${image ? "24" : "0"}px;">
<h2 style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:25px;line-height:30px;margin:0 0 7px;color:${ink};">${escape(name)}</h2>
${location ? `<p style="font-size:13px;line-height:19px;margin:0 0 14px;">&#9679;&nbsp; ${escape(location)}</p>` : ""}
<a href="${escape(livret)}" style="display:inline-block;padding:11px 18px;border:1px solid #b9a48a;border-radius:7px;text-decoration:none;color:#806750;font-weight:bold;font-size:14px;">Voir le livret d’accueil &nbsp; →</a>
</td></tr></table></td></tr></table>
<table role="presentation" width="100%" style="margin-top:7px;background:${card};border-radius:10px;"><tr>
${summaryCell("calendar", "DATES", `Du ${escape(from)}<br>au ${escape(to)}<br>(${escape(duration)})`)}
${summaryCell("users", "VOYAGEURS", escape(guests))}
${summaryCell("card", "MONTANT RÉGLÉ", escape(amount))}
${summaryCell("check", "STATUT", "Réservation<br>confirmée et payée", true)}
</tr></table>
<table role="presentation" width="100%" style="margin-top:7px;background:${card};border-radius:10px;"><tr>
<td class="time-cell" width="50%" style="padding:13px 16px;"><table role="presentation"><tr><td style="padding-right:15px;">${circle("key")}</td><td><p style="font-size:10px;font-weight:bold;letter-spacing:1.5px;margin:0 0 8px;">VOTRE ARRIVÉE</p><p style="font-size:13px;margin:0;">${escape(arrivalText)}</p></td></tr></table></td>
<td class="time-cell" width="50%" style="padding:13px 16px;border-left:1px solid #dfd2c2;"><table role="presentation"><tr><td style="padding-right:15px;">${circle("key")}</td><td><p style="font-size:10px;font-weight:bold;letter-spacing:1.5px;margin:0 0 8px;">VOTRE DÉPART</p><p style="font-size:13px;margin:0;">${escape(departureText)}</p></td></tr></table></td>
</tr></table>
<table role="presentation" width="100%" style="margin-top:7px;background:${card};border-radius:10px;"><tr><td style="padding:16px 18px;">
<table role="presentation" width="100%"><tr><td width="60" valign="top" style="padding-right:14px;">${circle("message")}</td><td>
<p style="font-size:10px;font-weight:bold;letter-spacing:2px;margin:0 0 7px;">UNE QUESTION ?</p><p style="font-size:12px;line-height:18px;margin:0 0 10px;">Notre équipe reste à votre disposition pour toute demande avant ou pendant votre séjour.</p>
<table role="presentation" width="100%"><tr><td class="contact-button" style="padding-right:12px;"><a href="tel:${escape(CONTACT.telephoneTel)}" style="display:block;text-align:center;border:1px solid #85858a;border-radius:6px;text-decoration:none;padding:10px 5px;font-size:14px;">☎ &nbsp; ${escape(CONTACT.telephone)}</a></td><td class="contact-button"><a href="mailto:${escape(CONTACT.email)}" style="display:block;text-align:center;border:1px solid #85858a;border-radius:6px;text-decoration:none;padding:10px 5px;font-size:14px;">✉ &nbsp; ${escape(CONTACT.email)}</a></td></tr></table>
<p style="font-size:11px;margin:9px 0 0;">Nous répondons rapidement, 7j/7.</p></td></tr></table></td></tr></table>
</td></tr>
<tr><td style="padding:14px 40px;background:#d6c6af;color:#ffffff;font-size:13px;line-height:22px;">
<a href="tel:${escape(CONTACT.telephoneTel)}" style="color:white;text-decoration:none;">☎ &nbsp; ${escape(CONTACT.telephone)}</a><br>
<a href="${escape(SITE.url)}" style="color:white;text-decoration:none;">◎ &nbsp; www.zen-villa.fr</a><br>
<a href="mailto:${escape(CONTACT.email)}" style="color:white;text-decoration:none;">✉ &nbsp; ${escape(CONTACT.email)}</a>
</td></tr></table></td></tr></table></body></html>`;
  return { subject: `Réservation confirmée – ${name}`, text, html };
}
