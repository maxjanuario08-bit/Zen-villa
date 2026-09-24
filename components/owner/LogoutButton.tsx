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
      className={`whitespace-nowrap rounded-full border border-lagoon px-3 py-1 text-xs font-medium text-lagoon transition-colors hover:bg-lagoon hover:text-white ${className}`}
    >
      {t("logout")}
    </button>
  );
}
