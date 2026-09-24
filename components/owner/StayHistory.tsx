"use client";

import { useLocale, useTranslations } from "next-intl";
import { nightsBetween, todayISO } from "@/lib/booking";
import StayVisitRecap from "@/components/owner/StayVisitRecap";
import StayStatusBadges from "@/components/owner/StayStatusBadges";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

function stayName(stay: PaidStay, t: ReturnType<typeof useTranslations>) {
  if (stay.guestLabel) return stay.guestLabel;
  if (["martin", "laurent", "wright", "rossi"].includes(stay.guestKey)) {
    return t(`guests.${stay.guestKey}`);
  }
  return stay.guestKey;
}

function StayHistoryItem({
  stay,
  cleanings,
}: {
  stay: PaidStay;
  cleanings: readonly CleaningRecord[];
}) {
  const t = useTranslations("Compte");
  const locale = useLocale();
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-lagoon-dark">{stayName(stay, t)}</p>
        <StayStatusBadges stay={stay} cleanings={cleanings} />
      </div>
      <p className="text-foreground/70">
        {dateFmt.format(new Date(`${stay.checkIn}T12:00:00`))} →{" "}
        {dateFmt.format(new Date(`${stay.checkOut}T12:00:00`))} ·{" "}
        {t("calRecapNights", { count: nightsBetween(stay.checkIn, stay.checkOut).length })} ·{" "}
        {t("bookGuestsCount", { count: stay.guests })}
      </p>
      <StayVisitRecap stay={stay} cleanings={cleanings} />
    </li>
  );
}

export default function StayHistory({
  stays,
  cleanings,
}: {
  stays: readonly PaidStay[];
  cleanings: readonly CleaningRecord[];
}) {
  const t = useTranslations("Compte");
  const today = todayISO();
  const current = [...stays]
    .filter((stay) => stay.checkOut > today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const past = [...stays]
    .filter((stay) => stay.checkOut <= today)
    .sort((a, b) => b.checkOut.localeCompare(a.checkOut));

  return (
    <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card sm:p-7">
      <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("historyTitle")}</h2>
      <p className="mt-2 text-sm text-foreground/70">{t("historyLead")}</p>
      {current.length === 0 && past.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{t("historyEmpty")}</p>
      ) : (
        <div className="mt-5 space-y-6">
          {current.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-lagoon-dark">{t("historyCurrent")}</h3>
              <ul className="mt-2 divide-y divide-sand/40 text-sm">
                {current.map((stay) => (
                  <StayHistoryItem key={stay.id} stay={stay} cleanings={cleanings} />
                ))}
              </ul>
            </div>
          ) : null}
          {past.length > 0 ? (
            <div>
              {current.length > 0 ? (
                <h3 className="text-sm font-medium text-lagoon-dark">{t("historyPast")}</h3>
              ) : null}
              <ul className={`${current.length > 0 ? "mt-2" : ""} divide-y divide-sand/40 text-sm`}>
                {past.map((stay) => (
                  <StayHistoryItem key={stay.id} stay={stay} cleanings={cleanings} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
