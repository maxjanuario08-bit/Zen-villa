"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { analyticsPublicPath, GOOGLE_ANALYTICS_ID } from "@/lib/analytics";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  zvGoogleInitialized?: boolean;
  "ga-disable-G-0EWN4TFMJ2"?: boolean;
};

export default function GoogleAnalytics({ consent }: { consent: boolean }) {
  const pathname = usePathname();
  const lastPage = useRef("");
  useEffect(() => {
    const analyticsWindow = window as AnalyticsWindow;
    const allowed = consent && analyticsPublicPath(pathname);
    analyticsWindow[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = !allowed;
    if (!allowed) { lastPage.current = ""; return; }
    analyticsWindow.dataLayer ??= [];
    // The Google command queue uses an Arguments object, as in the official gtag snippet.
    // eslint-disable-next-line prefer-rest-params
    analyticsWindow.gtag ??= function () { analyticsWindow.dataLayer!.push(arguments); };
    const gtag = analyticsWindow.gtag;
    if (!analyticsWindow.zvGoogleInitialized) {
      gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      gtag("js", new Date());
      gtag("config", GOOGLE_ANALYTICS_ID, { send_page_view: false, cookie_expires: 60 * 60 * 24 * 395, cookie_update: false, allow_google_signals: false, allow_ad_personalization_signals: false });
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
      document.head.appendChild(script);
      analyticsWindow.zvGoogleInitialized = true;
    }
    if (lastPage.current !== pathname) {
      // Never send query strings, fragments, booking references or form values.
      gtag("event", "page_view", { page_location: `${window.location.origin}${pathname}`, page_title: document.title, page_referrer: "" });
      lastPage.current = pathname;
    }
  }, [consent, pathname]);
  return null;
}
