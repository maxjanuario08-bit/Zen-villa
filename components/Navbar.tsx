"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CONTACT } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/proprietaires", label: "Propriétaires" },
  { href: "/voyageurs", label: "Voyageurs" },
  { href: "/packs", label: "Packs" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-sand/50 shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link href="/" className="md:hidden font-serif text-xl font-semibold text-lagoon-dark">
          Zenvilla
        </Link>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-lagoon"
                  : "text-foreground/80 hover:text-lagoon"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a
            href={`tel:${CONTACT.telephoneRaw}`}
            className="flex items-center gap-2 text-foreground/80 hover:text-lagoon transition-colors font-medium text-sm"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {CONTACT.telephone}
          </a>
          <Link
            href="/contact"
            className="rounded-full bg-lagoon px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-lagoon-dark transition-all hover:shadow-lg"
          >
            Demander un devis
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-sand-light transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-sand/50 bg-white py-4 px-4 animate-fade-in">
          <a
            href={`tel:${CONTACT.telephoneRaw}`}
            className="flex items-center gap-2 py-2 text-base font-medium text-foreground"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {CONTACT.telephone}
          </a>
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2 text-base font-medium ${
                  pathname === link.href ? "text-lagoon" : "text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="rounded-full bg-lagoon px-5 py-3 text-center text-sm font-medium text-white mt-2"
              onClick={() => setIsOpen(false)}
            >
              Demander un devis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
