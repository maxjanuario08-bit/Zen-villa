import { CONTACT } from "@/lib/constants";

function fromAddress() {
  return process.env.RESEND_FROM?.trim() || `Zenvilla <${CONTACT.email}>`;
}

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  idempotencyKey?: string;
}) {
  const to = input.to.trim().toLowerCase();
  if (!to.includes("@") || to.endsWith("@localhost")) return;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn("mail: RESEND_API_KEY manquant, e-mail non envoyé");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? {"Idempotency-Key":input.idempotencyKey} : {}),
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [to],
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("mail: Resend", res.status, detail);
    return false;
  }
  return true;
}
