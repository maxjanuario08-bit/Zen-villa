"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/owner/PasswordField";

export default function StaffSignupForm() {
  const t = useTranslations("Equipe");
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "exists" | "weak" | "unavailable" | "code"
  >("idle");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (password !== confirm) {
      setStatus("error");
      return;
    }
    if (password.length < 8) {
      setStatus("weak");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/owner/staff/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          password,
          teamCode: String(data.get("teamCode") ?? ""),
        }),
      });
      if (res.status === 503) {
        setStatus("unavailable");
        return;
      }
      if (res.status === 409) {
        setStatus("exists");
        return;
      }
      if (res.status === 401) {
        setStatus("code");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(body.error === "weak" ? "weak" : "error");
        return;
      }
      router.push("/equipe");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="staff-name" className="mb-1 block text-sm font-medium">
          {t("signupName")}
        </label>
        <input
          id="staff-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
        />
      </div>
      <div>
        <label htmlFor="staff-signup-email" className="mb-1 block text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="staff-signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
        />
      </div>
      <PasswordField
        id="staff-signup-password"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        label={t("password")}
        revealLabel={t("showPassword")}
        visible={showPassword}
        onVisibleChange={setShowPassword}
        hint={<p className="mt-1 text-xs text-muted">{t("passwordHint")}</p>}
      />
      <PasswordField
        id="staff-confirm"
        name="confirm"
        autoComplete="new-password"
        required
        minLength={8}
        label={t("signupConfirm")}
        revealLabel={t("showPassword")}
        visible={showPassword}
        onVisibleChange={setShowPassword}
        showToggle={false}
      />
      <PasswordField
        id="staff-team-code"
        name="teamCode"
        autoComplete="off"
        required
        minLength={8}
        label={t("teamCode")}
        revealLabel={t("showPassword")}
        hint={<p className="mt-1 text-xs text-muted">{t("teamCodeHint")}</p>}
      />
      {status === "error" && <p className="text-sm text-red-600">{t("signupError")}</p>}
      {status === "exists" && <p className="text-sm text-red-600">{t("signupExists")}</p>}
      {status === "weak" && <p className="text-sm text-red-600">{t("signupWeak")}</p>}
      {status === "code" && <p className="text-sm text-red-600">{t("signupBadCode")}</p>}
      {status === "unavailable" && <p className="text-sm text-red-600">{t("unavailable")}</p>}
      <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? t("signupSending") : t("signupSubmit")}
      </Button>
      <p className="text-center text-sm text-foreground/70">
        {t("hasAccount")}{" "}
        <Link href="/equipe" className="font-medium text-lagoon hover:text-lagoon-dark">
          {t("submit")}
        </Link>
      </p>
    </form>
  );
}
