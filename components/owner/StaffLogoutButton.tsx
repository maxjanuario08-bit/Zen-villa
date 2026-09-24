"use client";

import { useTranslations } from "next-intl";
import { afterAuthUrl } from "@/lib/site-origin";

export default function StaffLogoutButton() {
  const t = useTranslations("Equipe");

  async function logout() {
    await fetch("/api/owner/staff/logout", { method: "POST", credentials: "include" });
    window.location.assign(afterAuthUrl("/equipe"));
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="text-sm font-medium text-foreground/70 transition-colors hover:text-lagoon"
    >
      {t("logout")}
    </button>
  );
}
