"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CONTACT } from "@/lib/constants";
import LocaleSwitcher from "@/components/LocaleSwitcher";

const navKeys = ["home", "packs", "guests", "contact"] as const;

const PATHS = {
  home: "/",
  packs: "/packs",
  guests: "/voyageurs",
  contact: "/contact",
} satisfies Record<(typeof navKeys)[number], string>;

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-sand/50 shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link href="/" className="md:hidden font-serif text-xl font-semibold text-lagoon-dark">
          Zenvilla
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-serif text-xl font-semibold text-lagoon-dark whitespace-nowrap hover:text-lagoon transition-colors shrink-0"
            >
              Zenvilla
            </Link>
            {navKeys.map((key) => {
              const href = PATHS[key];
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === href ? "text-lagoon" : "text-foreground/80 hover:text-lagoon"
                  }`}
                >
                  {t(key)}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-5">
            <LocaleSwitcher />
            <a
              href={`tel:${CONTACT.telephoneTel}`}
              className="flex items-center gap-2 text-foreground/80 hover:text-lagoon transition-colors font-medium text-sm"
              aria-label={`${t("phoneAria")}: ${CONTACT.telephone}`}
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
            <Link
              href="/contact"
              className="rounded-full bg-lagoon px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-lagoon-dark transition-all hover:shadow-lg"
            >
              {t("ctaQuote")}
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-sand-light transition-colors"
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
        <div className="md:hidden border-t border-sand/50 bg-white py-4 px-4 animate-fade-in space-y-4">
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
