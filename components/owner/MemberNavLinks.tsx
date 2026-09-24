"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LogoutButton from "@/components/owner/LogoutButton";

export default function MemberNavLinks({ className = "" }: { className?: string }) {
  const t = useTranslations("Nav");
  const tCompte = useTranslations("Compte");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    void fetch("/api/owner/session")
      .then((res) => res.json() as Promise<{ user: { email?: string } | null }>)
      .then((data) => setLoggedIn(Boolean(data.user?.email)))
      .catch(() => setLoggedIn(false));
  }, []);

  if (loggedIn) {
    return (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <Link href="/compte" className="text-xs font-medium text-foreground/70 hover:text-lagoon">
          {tCompte("accountNav")}
        </Link>
        <LogoutButton />
      </span>
    );
  }

  return (
    <Link
      href="/compte"
      className={`text-xs font-medium text-foreground/55 hover:text-lagoon transition-colors whitespace-nowrap ${className}`}
    >
      {t("member")}
    </Link>
  );
}
