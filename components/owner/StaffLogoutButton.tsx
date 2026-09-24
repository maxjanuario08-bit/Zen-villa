"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function StaffLogoutButton() {
  const t = useTranslations("Equipe");
  const router = useRouter();

  async function logout() {
    await fetch("/api/owner/staff/logout", { method: "POST" });
    router.refresh();
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
