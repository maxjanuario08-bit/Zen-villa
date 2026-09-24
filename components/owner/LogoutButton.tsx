"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const t = useTranslations("Compte");
  const router = useRouter();

  async function logout() {
    await fetch("/api/owner/logout", { method: "POST" });
    router.push("/connexion");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className={`text-sm font-medium text-foreground/70 hover:text-lagoon transition-colors ${className}`}
    >
      {t("logout")}
    </button>
  );
}
