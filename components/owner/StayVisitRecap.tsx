"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

function cleanerLabel(id: string, t: ReturnType<typeof useTranslations>) {
  if (["marie", "luca"].includes(id)) return t(`cleaners.${id}`);
  return id;
}

function dayLabel(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${iso}T12:00:00`));
}

function visitWhen(
  locale: string,
  day: string,
  slot?: string | null,
  stamp?: string | null,
) {
  const date = dayLabel(day, locale);
  if (slot) return `${date} · ${slot}`;
  if (stamp) {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(stamp));
  }
  return date;
}

export default function StayVisitRecap({
  stay,
  cleanings,
}: {
  stay: PaidStay;
  cleanings: readonly CleaningRecord[];
}) {
  const t = useTranslations("Compte");
  const locale = useLocale();
  const related = cleanings.filter((row) => row.stayId === stay.id);
  const photos = [
    ...(stay.checkInPhotos ?? []),
    ...(stay.checkOutPhotos ?? []),
    ...related.flatMap((row) => [...row.photos]),
  ];

  return (
    <div className="mt-2 space-y-1 text-sm text-foreground/80">
      <p>
        {stay.checkedInBy
          ? t("checkedInByWhen", {
              name: stay.checkedInBy,
              when: visitWhen(locale, stay.checkIn, stay.checkInTime, stay.checkedInAt),
            })
          : t("checkInPending")}
      </p>
      <p>
        {stay.checkedOutBy
          ? t("checkedOutByWhen", {
              name: stay.checkedOutBy,
              when: visitWhen(locale, stay.checkOut, stay.checkOutTime, stay.checkedOutAt),
            })
          : t("checkOutPending")}
      </p>
      {related.length === 0 ? (
        <p>{t("cleanedNo")}</p>
      ) : (
        related.map((row) => (
          <p key={row.id}>
            {t("historyClean", {
              name: cleanerLabel(row.cleanerId, t),
              date: dayLabel(row.date, locale),
              time: row.time,
            })}
          </p>
        ))
      )}
      {photos.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${stay.id}-photo-${i}`} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
