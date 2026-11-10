"use client";
import {trackSiteEvent} from "@/lib/analytics";
import AppointmentSection from "@/components/AppointmentSection";
import {Link} from "@/i18n/navigation";

import Image from "next/image";
import {Phone,Mail,Globe,MapPin,MessageCircle} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PhoneField from "@/components/PhoneField";
import { internationalPhoneFromForm } from "@/lib/country-calling-codes";
import { CONTACT } from "@/lib/constants";

type FaqRow = { question: string; answer: string };

function FAQSection({
  faqRows,
}: {
  faqRows: readonly FaqRow[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {faqRows.map((item, index) => (
        <div key={item.question} className="border border-sand/50 rounded-2xl overflow-hidden bg-white">
          <button
            type="button"
            aria-expanded={openIndex === index}
            aria-controls={`contact-faq-${index}`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-6 py-4 text-left font-medium text-lagoon-dark hover:bg-sand-light/50 transition-colors"
          >
            {item.question}
            <svg
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div id={`contact-faq-${index}`} className="px-6 pb-4 pt-0 text-foreground/80 text-sm leading-relaxed">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}

const FORMSPREE_URL = process.env.NEXT_PUBLIC_FORMSPREE_ID
  ? `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`
  : null;

export default function ContactPage() {
  const t = useTranslations("ContactPage");
  const presentation = useTranslations("ContactPresentation");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const faqRows: FaqRow[] = [
    { question: t("faqHowTitle"), answer: t("faqHowBody") },
    { question: t("faqZonesTitle"), answer: t("faqZonesBody") },
    { question: presentation("processQ"), answer: presentation("processA") },
    { question: presentation("servicesQ"), answer: presentation("servicesA") },
    { question: t("faqPriceTitle"), answer: t("faqPriceBody") },
  ];

  const validate = (data: Record<string, string>) => {
    const err: Record<string, string> = {};
    if (!data.nom?.trim()) err.nom = t("errName");
    if (!data.email?.trim()) err.email = t("errEmail");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) err.email = t("errEmailFmt");
    if (!data.telephone?.trim()) err.telephone = t("errPhone");
    if (!data.message?.trim()) err.message = t("errMsg");
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const telephone = internationalPhoneFromForm(formData);
    formData.set("telephone", telephone);
    formData.delete("telephoneNational");
    const data: Record<string, string> = {
      ...(Object.fromEntries(formData) as Record<string, string>),
      telephone,
    };

    if (!validate(data)) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/site-mail/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: data.nom,
          email: data.email,
          telephone: data.telephone,
          ville: data.ville,
          type: data.type,
          message: data.message,
        }),
      });
      if (res.ok) {
        setStatus("success");
        trackSiteEvent("generate_lead","contact");
        form.reset();
        return;
      }
      if (!FORMSPREE_URL) {
        setStatus("error");
        return;
      }
      const fallback = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (fallback.ok) {
        setStatus("success");
        trackSiteEvent("generate_lead","contact");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return <div>
    <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0"><Image src="/hero-eau.png" alt={t("heroAlt")} fill priority sizes="100vw" className="object-cover"/><div className="absolute inset-0 bg-lagoon-dark/45"/></div>
      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8"><h1 className="max-w-3xl text-balance font-serif text-4xl font-semibold text-white sm:text-5xl">{presentation("heroTitle")}</h1><p className="mt-5 max-w-xl text-lg leading-relaxed text-white/95">{presentation("heroBody")}</p><Link href="/contact#formulaire" className="mt-7 inline-flex rounded-full border border-white/80 px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-lagoon-dark">{presentation("write")}</Link></div>
    </section>
    <section className="bg-background px-4 py-8 sm:px-6 sm:py-12 lg:px-8"><div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <AppointmentSection />
      <Card hover={false} className="!p-5 sm:!p-6"><h2 className="mb-5 font-serif text-2xl font-semibold text-lagoon-dark">{presentation("infos")}</h2><dl className="space-y-4 text-sm">
        <div className="flex items-start gap-3"><Phone size={19} aria-hidden="true" className="shrink-0 text-lagoon"/><div><dt className="inline font-semibold">{presentation("phone")} : </dt><dd className="inline"><a href={`tel:${CONTACT.telephoneTel}`} className="text-lagoon hover:underline">{CONTACT.telephone}</a></dd></div></div>
        <div className="flex items-start gap-3"><Mail size={19} aria-hidden="true" className="shrink-0 text-lagoon"/><div className="min-w-0"><dt className="inline font-semibold">{presentation("email")} : </dt><dd className="inline"><a href={`mailto:${CONTACT.email}`} className="break-all text-lagoon hover:underline">{CONTACT.email}</a></dd></div></div>
        <div className="flex items-start gap-3"><MessageCircle size={19} aria-hidden="true" className="shrink-0 text-lagoon"/><div><dt className="inline font-semibold">{presentation("channels")} : </dt><dd className="inline text-muted">{presentation("channelsBody")}</dd></div></div>
        <div className="flex items-start gap-3"><Globe size={19} aria-hidden="true" className="shrink-0 text-lagoon"/><div><dt className="inline font-semibold">{presentation("languages")} : </dt><dd className="inline text-muted">{presentation("languagesBody")}</dd></div></div>
        <div className="flex items-start gap-3"><MapPin size={19} aria-hidden="true" className="shrink-0 text-lagoon"/><div><dt className="inline font-semibold">{presentation("zones")} : </dt><dd className="inline text-muted">{presentation("zonesBody")}</dd></div></div>
      </dl></Card>
      <div id="formulaire" className="scroll-mt-28 min-w-0"><Card hover={false} className="!p-5 sm:!p-6"><h2 className="mb-6 font-serif text-2xl font-semibold text-lagoon-dark">{presentation("write")}</h2>
                <form data-analytics-form="contact" method="post" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-foreground mb-1">
                      {t("lblName")}
                    </label>
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors"
                      placeholder={t("phName")}
                    />
                    {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      {t("lblEmail")}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors"
                      placeholder={t("phEmail")}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="telephone" className="block text-sm font-medium text-foreground mb-1">
                      {t("lblPhone")}
                    </label>
                    <PhoneField id="telephone" required placeholder={t("phPhone")} />
                    {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
                  </div>
                  <div>
                    <label htmlFor="ville" className="block text-sm font-medium text-foreground mb-1">
                      {t("lblCity")}
                    </label>
                    <input
                      id="ville"
                      name="ville"
                      type="text"
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors"
                      placeholder={t("phCity")}
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
                      {t("lblType")}
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors"
                    >
                      <option value="">{t("typeOpt")}</option>
                      <option value="Villa">{t("typeVilla")}</option>
                      <option value="Appartement">{t("typeApt")}</option>
                      <option value="Maison">{t("typeMaison")}</option>
                      <option value="Autre">{t("typeAutre")}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                      {t("lblMsg")}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors resize-none"
                      placeholder={t("phMsg")}
                    />
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                  </div>
                  {status === "success" && (
                    <p role="status" className="text-sm text-green-600 font-medium sm:col-span-2">
                      {FORMSPREE_URL ? t("successFormspree") : t("successMailto")}
                    </p>
                  )}
                  {status === "error" && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{t("errorSubmit")}</p>}
                  <Button type="submit" variant="primary" className="w-full sm:col-span-2" disabled={status === "loading"}>
                    {status === "loading" ? t("sending") : t("send")}
                  </Button>
                </form>
      </Card></div>
      <Card hover={false} className="!p-5 sm:!p-6"><h2 id="faq" className="mb-6 scroll-mt-28 font-serif text-2xl font-semibold text-lagoon-dark">{presentation("faq")}</h2><FAQSection faqRows={faqRows}/></Card>
    </div></section>
    <section className="border-t border-sand/60 bg-sand-light/60 px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row"><h2 className="text-center font-serif text-2xl font-semibold text-lagoon-dark">{presentation("quick")}</h2><div className="flex flex-wrap justify-center gap-3"><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-lagoon px-5 py-3 text-sm font-semibold text-lagoon"><MessageCircle size={17} aria-hidden="true"/>WhatsApp</a><a href={`tel:${CONTACT.telephoneTel}`} className="inline-flex items-center gap-2 rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-white"><Phone size={17} aria-hidden="true"/>{presentation("call")}</a></div></div></section>
  </div>;
}
