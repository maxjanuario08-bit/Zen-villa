"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "zenvilla-cookie-consent";

export default function SiteAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted");
    sync();
    window.addEventListener("zenvilla-consent", sync);
    return () => window.removeEventListener("zenvilla-consent", sync);
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}
