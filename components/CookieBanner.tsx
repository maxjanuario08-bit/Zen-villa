"use client";

import { Link } from "@/i18n/navigation";
import { useState, useEffect, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import {COOKIE_CONSENT_KEY,ANALYTICS_OPTOUT_KEY} from "@/lib/analytics";
const readOptOut = () => localStorage.getItem(ANALYTICS_OPTOUT_KEY)==="1";

function subscribeConsent(callback: () => void) {
  window.addEventListener("zenvilla-consent", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("zenvilla-consent", callback);
    window.removeEventListener("storage", callback);
  };
}
const readConsent = () => localStorage.getItem(COOKIE_CONSENT_KEY);
const serverConsent = () => "loading";

export default function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const [isVisible, setIsVisible] = useState(false);
  const consent = useSyncExternalStore(subscribeConsent, readConsent, serverConsent);
  const optedOut=useSyncExternalStore(subscribeConsent,readOptOut,()=>false);
  const toggleOptOut=()=>{
    if(optedOut)localStorage.removeItem(ANALYTICS_OPTOUT_KEY);else localStorage.setItem(ANALYTICS_OPTOUT_KEY,"1");
    window.dispatchEvent(new Event("zenvilla-consent"));
  };

  useEffect(() => {
    const open = () => setIsVisible(true);
    window.addEventListener("zenvilla-open-consent", open);
    return () => window.removeEventListener("zenvilla-open-consent", open);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    window.dispatchEvent(new Event("zenvilla-consent"));
    setIsVisible(false);
  };

  const refuseCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "refused");
    window.dispatchEvent(new Event("zenvilla-consent"));
    setIsVisible(false);
  };

  if (!isVisible && consent !== null) return null;

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
            {t("title")}
          </h2>
          <p id="cookie-banner-desc" className="mt-1 text-sm text-foreground/80">
            {t("description")}{" "}
            <Link href="/politique-confidentialite#cookies" className="text-lagoon hover:underline">
              {t("learnMore")}
            </Link>
          </p>
          <p className="mt-2 text-xs text-muted">{t(optedOut?"excludedStatus":"excludeHint")}</p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap gap-3 sm:w-80 sm:shrink-0">
          <button
            type="button"
            onClick={refuseCookies}
            className="min-h-11 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground border border-sand/60 rounded-full hover:bg-sand-light transition-colors"
          >
            {t("refuse")}
          </button>
          <button
            type="button"
            onClick={acceptCookies}
            className="min-h-11 px-4 py-2 text-sm font-medium text-white bg-lagoon rounded-full hover:bg-lagoon-dark transition-colors"
          >
            {t("accept")}
          </button>
          <button type="button" aria-pressed={optedOut} onClick={toggleOptOut} className="min-h-11 rounded-full border border-sand px-4 py-2 text-sm font-medium text-lagoon-dark">{t(optedOut?"includeDevice":"excludeDevice")}</button>
        </div>
      </div>
    </div>
  );
}
