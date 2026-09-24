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
      className={`rounded-full border border-lagoon px-4 py-1.5 text-sm font-medium text-lagoon hover:bg-lagoon hover:text-white transition-colors ${className}`}
    >
      {t("logout")}
    </button>
  );
}
