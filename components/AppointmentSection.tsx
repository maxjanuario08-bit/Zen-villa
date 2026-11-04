"use client";
import Image from "next/image";
import {Clock,ArrowUpRight,Mail,House} from "lucide-react";
import {useTranslations} from "next-intl";
import {APPOINTMENT_URL} from "@/lib/appointments";
import {CONTACT} from "@/lib/constants";
export default function AppointmentSection(){
 const t=useTranslations("Assistant");
 return <section id="rendez-vous" aria-labelledby="appointment-title" className="scroll-mt-28 overflow-hidden rounded-2xl border border-sand/60 bg-white p-4 sm:p-5">
  <div className="grid h-full gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
   <div className="relative min-h-44 overflow-hidden rounded-xl sm:min-h-60"><Image src="/logements/pinson/terrasse.jpg" alt="" fill sizes="(min-width:1024px) 25vw, (min-width:640px) 40vw, 100vw" className="object-cover"/></div>
   <div className="flex flex-col justify-center"><p className="flex items-center gap-2 text-xs font-semibold text-lagoon"><House size={17} aria-hidden="true"/>{t("appointmentEyebrow")}</p><h2 id="appointment-title" className="mt-2 font-serif text-3xl font-semibold text-lagoon-dark">{t("appointmentTitle")}</h2><p className="mt-3 text-sm leading-relaxed text-muted">{t("appointmentDescription")}</p><p className="mt-3 flex items-center gap-2 text-sm font-medium text-lagoon-dark"><Clock size={17} aria-hidden="true"/>15 min</p><div className="mt-5 flex flex-wrap items-center gap-3">{APPOINTMENT_URL?<a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-lagoon px-4 py-2.5 text-sm font-semibold text-white hover:bg-lagoon-dark">{t("chooseSlot")}<ArrowUpRight size={15} aria-hidden="true"/><span className="sr-only">{t("newTab")}</span></a>:<a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(t("appointmentSubject")+" · 15 min")}`} className="inline-flex items-center gap-2 rounded-full bg-lagoon px-4 py-2.5 text-sm font-semibold text-white hover:bg-lagoon-dark"><Mail size={15} aria-hidden="true"/>{t("requestAppointment")}</a>}<a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-lagoon underline underline-offset-4">WhatsApp</a></div></div>
  </div>
 </section>;
}
