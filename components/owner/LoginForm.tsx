"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const t = useTranslations("Compte");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "unavailable">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    try {
      const res = await fetch("/api/owner/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
        }),
      });
      if (res.status === 503) {
        setStatus("unavailable");
        return;
      }
      if (!res.ok) {
        const admin = await fetch("/api/owner/admin/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: String(data.get("email") ?? ""),
            password: String(data.get("password") ?? ""),
          }),
        });
        if (admin.ok) {
          window.location.assign("https://www.zen-villa.fr/admin");
          return;
        }
        setStatus("error");
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
        <label htmlFor="owner-email" className="mb-1 block text-sm font-medium">
          {t("loginEmail")}
        </label>
        <input
          id="owner-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
        />
      </div>
      <div>
        <label htmlFor="owner-password" className="mb-1 block text-sm font-medium">
          {t("loginPassword")}
        </label>
        <input
          id="owner-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{t("loginError")}</p>}
      {status === "unavailable" && <p className="text-sm text-red-600">{t("loginUnavailable")}</p>}
      <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? t("loginSending") : t("loginSubmit")}
      </Button>
      <p className="text-center text-sm text-foreground/70">
        {t("loginNoAccount")}{" "}
        <Link href="/inscription" className="font-medium text-lagoon hover:text-lagoon-dark">
          {t("signupSubmit")}
        </Link>
      </p>
      <p className="text-center text-sm">
        <Link href="/admin" className="font-medium text-lagoon hover:text-lagoon-dark">
          {t("loginTeam")}
        </Link>
      </p>
    </form>
  );
}
