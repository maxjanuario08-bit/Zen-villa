import { createHash, randomBytes } from "crypto";
import { pg } from "@/lib/owner-pg";
import { ownerAdminEmail, databaseUrl } from "@/lib/owner-config";
import { findAccountByEmail, hashPassword } from "@/lib/owner-accounts";
import { getStaffAccountByEmail } from "@/lib/staff-accounts";
import { sendMail } from "@/lib/mail";
import { SITE } from "@/lib/constants";
import type { AccountRole } from "@/lib/password-credentials";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export async function requestPasswordReset(role: AccountRole, email: string, locale: string) {
  if (!databaseUrl() || !process.env.RESEND_API_KEY?.trim()) throw new Error("Reset unavailable");
  const exists = role === "admin" ? email === ownerAdminEmail()
    : role === "owner" ? Boolean(await findAccountByEmail(email)) : Boolean(await getStaffAccountByEmail(email));
  if (!exists) return;
  const token = randomBytes(32).toString("hex");
  const sql = await pg();
  await sql`DELETE FROM password_reset_tokens WHERE expires_at < NOW()`;
  await sql`INSERT INTO password_reset_tokens (token_hash, role, email, expires_at)
    VALUES (${digest(token)}, ${role}, ${email}, NOW() + INTERVAL '30 minutes')`;
  const link = new URL(`${locale === "fr" ? "" : `/${locale}`}/reinitialiser-mot-de-passe`, SITE.url);
  link.hash = new URLSearchParams({ token }).toString();
  link.searchParams.set("role", role);
  const copy = locale === "en" ? {
    subject: "Reset your Zenvilla password", text: "Choose a new password using this link. It expires in 30 minutes and can only be used once.", ignore: "If you did not request this, ignore this email. Your password has not changed."
  } : locale === "es" ? {
    subject: "Restablecer su contraseña de Zenvilla", text: "Elija una nueva contraseña con este enlace. Caduca en 30 minutos y solo se puede usar una vez.", ignore: "Si no lo ha solicitado, ignore este correo. Su contraseña no ha cambiado."
  } : {
    subject: "Réinitialiser votre mot de passe Zenvilla", text: "Choisissez un nouveau mot de passe avec ce lien. Il expire dans 30 minutes et ne peut être utilisé qu’une seule fois.", ignore: "Si vous n’avez pas fait cette demande, ignorez cet email. Votre mot de passe n’a pas changé."
  };
  const sent = await sendMail({ to: email, subject: copy.subject, text: `${copy.text}\n\n${link.href}\n\n${copy.ignore}` });
  if (!sent) {
    await sql`DELETE FROM password_reset_tokens WHERE token_hash = ${digest(token)}`;
    console.error("password-reset: email delivery request failed");
  } else {
    console.info("password-reset: reset email accepted by provider");
  }
}

export async function completePasswordReset(role: AccountRole, token: string, password: string) {
  if (!/^[a-f0-9]{64}$/.test(token) || password.length < 12 || password.length > 128) return false;
  const sql = await pg();
  const tokenHash = digest(token);
  // Check before scrypt; consumption and credential change below are one atomic SQL statement.
  const valid = await sql`SELECT 1 FROM password_reset_tokens WHERE token_hash = ${tokenHash} AND role = ${role} AND expires_at > NOW()`;
  if (!valid.length) return false;
  const passwordHash = await hashPassword(password);
  const result = await sql`
    WITH consumed AS (
      DELETE FROM password_reset_tokens t
      WHERE t.token_hash = ${tokenHash} AND t.role = ${role} AND t.expires_at > NOW()
        AND NOT EXISTS (SELECT 1 FROM account_passwords p WHERE p.role = t.role AND p.email = t.email AND p.changed_at >= t.created_at)
      RETURNING t.role, t.email, t.created_at
    )
    INSERT INTO account_passwords (role, email, password_hash, changed_at)
    SELECT role, email, ${passwordHash}, NOW() FROM consumed
    ON CONFLICT (role, email) DO UPDATE SET password_hash = EXCLUDED.password_hash, changed_at = EXCLUDED.changed_at
    WHERE account_passwords.changed_at < (SELECT created_at FROM consumed LIMIT 1)
    RETURNING email
  `;
  return result.length === 1;
}
