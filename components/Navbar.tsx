"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CONTACT } from "@/lib/constants";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import MemberNavLinks from "@/components/owner/MemberNavLinks";

const navKeys = ["home", "formules", "rentals", "trust", "guests", "contact"] as const;

const PATHS = {
  home: "/",
  formules: "/formules",
  rentals: "/logements",
  trust: "/confiance",
  guests: "/voyageurs",
  contact: "/contact",
} satisfies Record<(typeof navKeys)[number], string>;

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-sand/50 shadow-sm">
      <nav className="mx-auto flex h-16 w-full max-w-[92rem] items-center justify-between px-3 sm:px-5 lg:px-6">
        <Link href="/" className="lg:hidden font-serif text-xl font-semibold text-lagoon-dark">
          Zenvilla
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex min-w-0 flex-1 items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-4 xl:gap-6">
            <Link
              href="/"
              className="shrink-0 whitespace-nowrap font-serif text-xl font-semibold text-lagoon-dark transition-colors hover:text-lagoon"
            >
              Zenvilla
            </Link>
            {navKeys.map((key) => {
              const href = PATHS[key];
              return (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 whitespace-nowrap text-sm font-medium transition-colors ${
                    pathname === href ? "text-lagoon" : "text-foreground/80 hover:text-lagoon"
                  }`}
                >
                  {t(key)}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <MemberNavLinks />
            <LocaleSwitcher />
            <a
              href={`tel:${CONTACT.telephoneTel}`}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-foreground/80 transition-colors hover:text-lagoon"
              aria-label={`${t("phoneAria")}: ${CONTACT.telephone}`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {CONTACT.telephone}
            </a>
            <Link
              href="/contact"
              className="shrink-0 whitespace-nowrap rounded-full bg-lagoon px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-lagoon-dark hover:shadow-lg"
            >
              {t("ctaQuote")}
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg text-foreground hover:bg-sand-light transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t("menuAria")}
          aria-expanded={isOpen}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile */}
      {isOpen && (
        <div className="lg:hidden border-t border-sand/50 bg-white py-4 px-4 animate-fade-in space-y-4">
          <div className="pb-2">
            <LocaleSwitcher />
          </div>
          <a
            href={`tel:${CONTACT.telephoneTel}`}
            className="flex items-center gap-2 py-2 text-base font-medium text-foreground"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {CONTACT.telephone}
          </a>
          <div className="flex flex-col gap-4">
            {navKeys.map((key) => {
              const href = PATHS[key];
              return (
                <Link
                  key={href}
                  href={href}
                  className={`py-2 text-base font-medium ${pathname === href ? "text-lagoon" : "text-foreground"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {t(key)}
                </Link>
              );
            })}
            <MemberNavLinks className="py-2" />
            <Link
              href="/contact"
              className="rounded-full bg-lagoon px-5 py-3 text-center text-sm font-medium text-white mt-2"
              onClick={() => setIsOpen(false)}
            >
              {t("ctaQuote")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
