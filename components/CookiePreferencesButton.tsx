"use client";
import { useTranslations } from "next-intl";
export default function CookiePreferencesButton() {
  const t = useTranslations("CookieBanner");
  return <button type="button" className="text-sm text-white/60 hover:text-white" onClick={() => window.dispatchEvent(new Event("zenvilla-open-consent"))}>{t("manage")}</button>;
}
