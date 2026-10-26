"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PasswordField from "@/components/owner/PasswordField";
import type { AccountRole } from "@/lib/password-credentials";

type Props = { role: AccountRole; token?: string; reset?: boolean };

export default function PasswordRecoveryForm({ role, token, reset = false }: Props) {
  const t = useTranslations("PasswordRecovery");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "busy" | "success" | "error" | "limited">("idle");
  const login = role === "admin" ? "/admin" : role === "staff" ? "/equipe" : "/connexion";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "busy") return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (reset && (password.length < 12 || password !== confirm)) { setStatus("error"); return; }
    setStatus("busy");
    try {
      const response = await fetch(`/api/auth/password-reset/${reset ? "confirm" : "request"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset ? { role, token: token ?? new URLSearchParams(window.location.hash.slice(1)).get("token"), password, confirm } : { role, email: data.get("email"), locale }),
      });
      setStatus(response.ok ? "success" : response.status === 429 ? "limited" : "error");
    } catch { setStatus("error"); }
  }
  return (
    <div className="space-y-5">
      {status === "success" ? <p role="status" className="rounded-xl bg-lagoon/10 p-4 text-lagoon-dark">{t(reset ? "changed" : "sent")}</p> : (
        <form onSubmit={submit} className="space-y-5">
          {reset ? <>
            <PasswordField name="password" label={t("password")} revealLabel={t("show")} autoComplete="new-password" minLength={12} maxLength={128} required />
            <p className="text-sm text-muted">{t("minimum")}</p>
            <PasswordField name="confirm" label={t("confirm")} revealLabel={t("show")} autoComplete="new-password" minLength={12} maxLength={128} required />
          </> : <div>
            <label htmlFor="recovery-email" className="mb-2 block text-sm font-medium">{t("email")}</label>
            <input id="recovery-email" name="email" type="email" autoComplete="email" required maxLength={254} className="w-full rounded-xl border border-sand/60 px-4 py-3" />
          </div>}
          <button disabled={status === "busy"} className="w-full rounded-full bg-lagoon px-5 py-3 font-medium text-white disabled:opacity-50">{t(status === "busy" ? "busy" : reset ? "save" : "send")}</button>
          {status === "error" || status === "limited" ? <p role="alert" className="text-sm text-red-600">{t(status === "limited" ? "limited" : reset ? "invalid" : "error")}</p> : null}
        </form>
      )}
      {reset && status !== "success" ? <Link href={`/mot-de-passe-oublie?role=${role}`} className="block text-sm text-lagoon underline">{t("again")}</Link> : null}
      <Link href={login} className="block text-center text-sm text-lagoon underline">{t("back")}</Link>
    </div>
  );
}
