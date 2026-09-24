"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function AdminLogoutButton() {
  const t = useTranslations("Admin");
  const router = useRouter();

  async function logout() {
    await fetch("/api/owner/admin/logout", { method: "POST" });
    router.refresh();
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
