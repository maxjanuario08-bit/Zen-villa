"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/owner/PasswordField";

export default function SignupForm() {
  const t = useTranslations("Compte");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "exists" | "weak" | "unavailable">(
    "idle",
  );
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
      const res = await fetch("/api/owner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          password,
          propertyNote: String(data.get("propertyNote") ?? ""),
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
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(body.error === "weak" ? "weak" : "error");
        return;
      }
      router.push("/compte");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="owner-name" className="mb-1 block text-sm font-medium">
          {t("signupName")}
        </label>
        <input
          id="owner-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
        />
      </div>
      <div>
        <label htmlFor="owner-signup-email" className="mb-1 block text-sm font-medium">
          {t("loginEmail")}
        </label>
        <input
          id="owner-signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
        />
      </div>
      <PasswordField
        id="owner-signup-password"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        label={t("loginPassword")}
        revealLabel={t("showPassword")}
        visible={showPassword}
        onVisibleChange={setShowPassword}
        hint={<p className="mt-1 text-xs text-muted">{t("signupPasswordHint")}</p>}
      />
      <PasswordField
        id="owner-confirm"
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
      <div>
        <label htmlFor="owner-property" className="mb-1 block text-sm font-medium">
          {t("signupProperty")}
        </label>
        <input
          id="owner-property"
          name="propertyNote"
          type="text"
          maxLength={200}
          placeholder={t("signupPropertyPlaceholder")}
          className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{t("signupError")}</p>}
      {status === "exists" && <p className="text-sm text-red-600">{t("signupExists")}</p>}
      {status === "weak" && <p className="text-sm text-red-600">{t("signupWeak")}</p>}
      {status === "unavailable" && <p className="text-sm text-red-600">{t("loginUnavailable")}</p>}
      <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? t("signupSending") : t("signupSubmit")}
      </Button>
      <p className="text-center text-sm text-foreground/70">
        {t("signupHasAccount")}{" "}
        <Link href="/connexion" className="font-medium text-lagoon hover:text-lagoon-dark">
          {t("loginSubmit")}
        </Link>
      </p>
    </form>
  );
}
