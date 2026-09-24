"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function StaffLoginForm() {
  const t = useTranslations("Equipe");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "unavailable" | "limited">(
    "idle",
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    try {
      const res = await fetch("/api/owner/staff/login", {
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
      if (res.status === 429) {
        setStatus("limited");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      window.location.assign("/equipe");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="staff-email" className="mb-1 block text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="staff-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
        />
      </div>
      <div>
        <label htmlFor="staff-password" className="mb-1 block text-sm font-medium">
          {t("password")}
        </label>
        <input
          id="staff-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{t("loginError")}</p>}
      {status === "limited" && <p className="text-sm text-red-600">{t("loginLimited")}</p>}
      {status === "unavailable" && <p className="text-sm text-red-600">{t("unavailable")}</p>}
      <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
