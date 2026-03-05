"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const COOKIE_CONSENT_KEY = "zenvilla-cookie-consent";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const refuseCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "refused");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-sand/50 shadow-lg animate-fade-in-up"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 id="cookie-banner-title" className="font-semibold text-foreground">
            Utilisation des cookies
          </h2>
          <p id="cookie-banner-desc" className="mt-1 text-sm text-foreground/80">
            Ce site utilise des cookies pour améliorer votre expérience. En cliquant sur « Accepter », vous consentez à leur utilisation.{" "}
            <Link href="/politique-confidentialite#cookies" className="text-lagoon hover:underline">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={refuseCookies}
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground border border-sand/60 rounded-full hover:bg-sand-light transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-medium text-white bg-lagoon rounded-full hover:bg-lagoon-dark transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
