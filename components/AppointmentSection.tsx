"use client";
import { CalendarDays, ArrowUpRight, Mail } from "lucide-react";
import {useTranslations} from "next-intl";
import {APPOINTMENT_URL} from "@/lib/appointments";
import {CONTACT} from "@/lib/constants";

export default function AppointmentSection(){
 const t=useTranslations("Assistant");
 return <section id="rendez-vous" aria-labelledby="appointment-title" className="scroll-mt-28 bg-white px-4 py-12 sm:px-6">
  <div className="mx-auto grid max-w-4xl gap-6 rounded-2xl border border-sand bg-sand-light/40 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
   <div><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-lagoon"><CalendarDays size={18} aria-hidden="true"/>{t("appointmentEyebrow")}</p><h2 id="appointment-title" className="font-serif text-3xl font-semibold text-lagoon-dark">{t("appointmentTitle")}</h2><p className="mt-3 max-w-xl text-muted">{t("appointmentDescription")}</p><p className="mt-2 text-sm text-muted">{t(APPOINTMENT_URL?"googleInfo":"appointmentFallback")}</p></div>
   <div className="flex flex-col gap-3">{APPOINTMENT_URL?<a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-lagoon px-5 py-3 font-medium text-white hover:bg-lagoon-dark">{t("chooseSlot")}<ArrowUpRight size={16} aria-hidden="true"/><span className="sr-only">{t("newTab")}</span></a>:<a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(t("appointmentSubject"))}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-lagoon px-5 py-3 font-medium text-white hover:bg-lagoon-dark"><Mail size={16} aria-hidden="true"/>{t("requestAppointment")}</a>}<a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="text-center text-sm font-semibold text-lagoon underline underline-offset-4">{t("whatsapp")}</a></div>
  </div>
 </section>;
}
