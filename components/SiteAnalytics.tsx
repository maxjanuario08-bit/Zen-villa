"use client";

import { Analytics } from "@vercel/analytics/next";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { analyticsPublicPath, COOKIE_CONSENT_KEY } from "@/lib/analytics";
import { useEffect, useState } from "react";


export default function SiteAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted");
    sync();
    window.addEventListener("zenvilla-consent", sync);
    return () => window.removeEventListener("zenvilla-consent", sync);
  }, []);

  return <>
    <GoogleAnalytics consent={enabled} />
    {enabled ? <Analytics beforeSend={(event) => analyticsPublicPath(new URL(event.url).pathname) ? { ...event, url: event.url.split(/[?#]/)[0] } : null} /> : null}
  </>;
}
