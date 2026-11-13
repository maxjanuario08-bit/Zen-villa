"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const field = "mt-1 block w-full rounded-xl border border-sand-dark/40 bg-white px-3 py-2.5";

export default function OwnerPricingForm() {
  const t = useTranslations("Pricing");
  const locale = useLocale();
  const [callback, setCallback] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const response = await fetch("/api/site-mail/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "owner-pricing",
          email: data.get("email"),
          telephone: data.get("telephone"),
          website: data.get("website"),
          pricingEmailConsent: data.has("pricingEmailConsent"),
          pricingPhoneConsent: callback,
        }),
      });
      if (!response.ok) throw new Error("Pricing email failed");
      form.reset();
      setCallback(false);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="tarifs-a-la-carte" className="mt-12 scroll-mt-24 rounded-2xl border border-sand/60 bg-white p-5 sm:p-6">
      <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("allPrices")}</h2>
      {locale !== "fr" && <p className="mt-2 text-sm text-muted">{t("formPdflanguage")}</p>}
      <form method="post" onSubmit={submit} className="mt-5 max-w-xl space-y-4 text-sm">
        <label className="block font-medium">
          {t("formEmail")}
          <input className={field} type="email" name="email" autoComplete="email" maxLength={120} required />
        </label>
        <input type="text" name="website" hidden autoComplete="off" />
        <label className="flex items-start gap-2">
          <input className="mt-1" type="checkbox" name="pricingEmailConsent" />
          {t("formOffers")}
        </label>
        <label className="flex items-start gap-2">
          <input className="mt-1" type="checkbox" checked={callback} onChange={(event) => setCallback(event.target.checked)} />
          {t("formCallback")}
        </label>
        {callback && <label className="block font-medium">
          {t("formPhone")}
          <input className={field} type="tel" name="telephone" autoComplete="tel" maxLength={30} required />
        </label>}
        <Link href="/politique-confidentialite" className="block text-xs text-lagoon-dark underline">{t("formPrivacy")}</Link>
        <button type="submit" disabled={status === "sending"} className="min-h-11 rounded-full bg-lagoon px-5 font-semibold text-white hover:bg-lagoon-dark disabled:opacity-60">
          {status === "sending" ? t("formSending") : t("formSubmit")}
        </button>
        {status === "success" && <p role="status">{t("formSuccess")}</p>}
        {status === "error" && <p role="alert" className="text-red-700">{t("formError")}</p>}
      </form>
    </section>
  );
}
