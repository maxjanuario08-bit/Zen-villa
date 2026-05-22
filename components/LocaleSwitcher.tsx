"use client";

import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Sélecteur de langue FR / EN / ES (routing next-intl) */
export default function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Languages");

  const labels = { fr: "FR", en: "EN", es: "ES" } as const;

  if (compact) {
    return (
      <nav
        className="inline-flex rounded-full bg-white/15 p-1 text-xs font-semibold"
        aria-label={t("switcherLabel")}
      >
        {routing.locales.map((loc) => (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            className={`rounded-full px-2 py-1 transition-colors ${
              locale === loc
                ? "bg-white text-lagoon-dark shadow-sm"
                : "text-white/90 hover:text-white"
            }`}
            prefetch={false}
          >
            {labels[loc as keyof typeof labels]}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <div className="flex items-center gap-2" aria-label={t("switcherLabel")}>
      <GlobeAltIcon className="h-4 w-4 shrink-0 text-foreground/50" aria-hidden />
      <div className="inline-flex rounded-full border border-sand/70 bg-background p-0.5 text-xs font-medium shadow-sm">
        {routing.locales.map((loc) => (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              locale === loc
                ? "bg-lagoon text-white shadow-sm"
                : "text-foreground/80 hover:bg-sand-light/80"
            }`}
            prefetch={false}
          >
            {labels[loc as keyof typeof labels]}
          </Link>
        ))}
      </div>
    </div>
  );
}
