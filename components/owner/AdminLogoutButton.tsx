"use client";

import { useTranslations } from "next-intl";
import { afterAuthUrl } from "@/lib/site-origin";

export default function AdminLogoutButton() {
  const t = useTranslations("Admin");

  async function logout() {
    await fetch("/api/owner/admin/logout", { method: "POST", credentials: "include" });
    window.location.assign(afterAuthUrl("/admin"));
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="text-sm font-medium text-foreground/70 hover:text-lagoon transition-colors"
    >
      {t("logout")}
    </button>
  );
}
