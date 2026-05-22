"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { voyageursServices } from "@/lib/voyageurs-services";
import { CONTACT } from "@/lib/constants";
import { useTranslations } from "next-intl";

const FORMSPREE_URL = process.env.NEXT_PUBLIC_FORMSPREE_ID
  ? `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`
  : null;

export default function DemanderPrestationPage() {
  const t = useTranslations("DemanderPrestation");
  const tGuest = useTranslations("guestServices");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const labelForSlug = (slug: string) => tGuest(`${slug}.label`);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const prestationSlug = String(formData.get("prestation") || "");
    const data = Object.fromEntries(formData) as Record<string, string>;

    if (!data.nom?.trim() || !data.email?.trim() || !data.telephone?.trim()) {
      return;
    }

    const prestationLabel = prestationSlug ? labelForSlug(prestationSlug) : "";

    if (!FORMSPREE_URL) {
      const subjectLabel = prestationLabel || t("guestLabel");
      const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
        `${t("heroTitle")} – ${subjectLabel}`,
      )}&body=${encodeURIComponent(
        [
          `${t("fieldService")} ${prestationLabel || "-"}`,
          "",
          `${t("fieldName")} ${data.nom}`,
          `${t("fieldEmail")} ${data.email}`,
          `${t("fieldPhone")} ${data.telephone}`,
          `${t("fieldPlace")}: ${data.lieu || "-"}`,
          `${t("fieldDates")}: ${data.dates || "-"}`,
          "",
          `${t("fieldMsg")}:`,
          data.message || "-",
        ].join("\n"),
      )}`;
      window.location.href = mailto;
      setStatus("success");
      return;
    }

    formData.append("_subject", `${t("heroTitle")} – ${prestationLabel || t("guestLabel")}`);
    setStatus("loading");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-cote.png"
            alt={t("bannerAlt")}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto">{t("heroSubtitle")}</p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <Card>
                <h2 className="font-serif text-2xl font-semibold text-lagoon-dark mb-2">{t("formTitle")}</h2>
                <p className="text-sm text-foreground/80 mb-6">{t("sideParagraph")}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="prestation" className="block text-sm font-medium text-foreground mb-1">
                      {t("fieldService")}
                    </label>
                    <select
                      id="prestation"
                      name="prestation"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                    >
                      <option value="">{t("optionPlaceholder")}</option>
                      {voyageursServices.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {labelForSlug(s.slug)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-foreground mb-1">
                      {t("fieldName")}
                    </label>
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder={t("nomPlaceholder")}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      {t("fieldEmail")}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder={t("emailPlaceholder")}
                    />
                  </div>
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-foreground mb-1">
                      {t("fieldPhone")}
                    </label>
                    <input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder={t("phonePlaceholder")}
                    />
                  </div>
                  <div>
                    <label htmlFor="lieu" className="block text-sm font-medium text-foreground mb-1">
                      {t("fieldPlace")}
                    </label>
                    <input
                      id="lieu"
                      name="lieu"
                      type="text"
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder={t("placePlaceholder")}
                    />
                  </div>
                  <div>
                    <label htmlFor="dates" className="block text-sm font-medium text-foreground mb-1">
                      {t("fieldDates")}
                    </label>
                    <input
                      id="dates"
                      name="dates"
                      type="text"
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder={t("datesPlaceholder")}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                      {t("fieldMsg")}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none resize-none"
                      placeholder={t("msgPlaceholder")}
                    />
                  </div>
                  {status === "success" && (
                    <p className="text-sm text-green-600 font-medium">
                      {FORMSPREE_URL ? t("successFormspree") : t("successMailto")}
                    </p>
                  )}
                  {status === "error" && <p className="text-sm text-red-600">{t("errSend")}</p>}
                  <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>
                    {status === "loading" ? t("sending") : t("submit")}
                  </Button>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                <h2 className="font-serif text-xl font-semibold text-lagoon-dark">{t("asideTitleDirect")}</h2>
                <p className="text-foreground/80 text-sm">{t("asideLead")}</p>
                <a
                  href={`tel:${CONTACT.telephoneRaw}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-sand/50 bg-white hover:border-lagoon/40 transition-colors"
                >
                  <span className="flex-shrink-0 w-12 h-12 rounded-full bg-lagoon/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-lagoon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs text-muted">{t("callCaption")}</p>
                    <p className="font-semibold text-lagoon-dark">{CONTACT.telephone}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-sand/50 bg-white hover:border-lagoon/40 transition-colors"
                >
                  <span className="flex-shrink-0 w-12 h-12 rounded-full bg-lagoon/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-lagoon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs text-muted">{t("emailCaption")}</p>
                    <p className="font-semibold text-lagoon-dark truncate">{CONTACT.email}</p>
                  </div>
                </a>
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-sand/50 bg-white hover:border-lagoon/40 transition-colors"
                >
                  <span className="flex-shrink-0 w-12 h-12 rounded-full bg-lagoon/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-lagoon" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs text-muted">{t("whatsappCaption")}</p>
                    <p className="font-semibold text-lagoon-dark">{t("whatsAction")}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
