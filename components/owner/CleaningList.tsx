import { getTranslations } from "next-intl/server";
import { signedCleaningPhotoUrl } from "@/lib/owner-media";
import { SEED_PAID_STAYS } from "@/lib/owner-seed";
import type { CleaningRecord } from "@/lib/owner-types";

type Props = {
  locale: string;
  records: readonly CleaningRecord[];
};

export default async function CleaningList({ locale, records }: Props) {
  const t = await getTranslations({ locale, namespace: "Compte" });
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  if (!records.length) {
    return (
      <section className="rounded-2xl border border-sand/40 bg-white p-5 sm:p-7 shadow-card">
        <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("cleaningTitle")}</h2>
        <p className="mt-3 text-sm text-foreground/70">{t("cleaningEmpty")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-sand/40 bg-white p-5 sm:p-7 shadow-card">
      <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("cleaningTitle")}</h2>
      <p className="mt-2 text-sm text-foreground/70">{t("cleaningLead")}</p>
      <ul className="mt-6 space-y-8">
        {records.map((row) => {
          const stay = SEED_PAID_STAYS.find((s) => s.id === row.stayId);
          const when = dateFmt.format(new Date(`${row.date}T12:00:00`));
          const cleaner =
            row.cleanerId === "marie" || row.cleanerId === "luca"
              ? t(`cleaners.${row.cleanerId}`)
              : row.cleanerId;
          const notes =
            row.notes ||
            (row.id.startsWith("clean-pinson-") ? t(`cleanings.${row.id}.notes`) : "");
          return (
            <li key={row.id} className="border-t border-sand/40 pt-6 first:border-t-0 first:pt-0">
              <p className="text-sm font-medium text-lagoon-dark">
                {when} · {row.time}
              </p>
              <p className="mt-1 text-sm text-foreground/80">
                {t("cleaningBy", { name: cleaner })}
                {stay ? ` · ${t("stayGuest", { guest: t(`guests.${stay.guestKey}`) })}` : null}
              </p>
              {notes ? (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-muted">{t("cleaningInventory")}</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/85">{notes}</p>
                </div>
              ) : null}
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-muted">{t("cleaningPhotos")}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {row.photos.map((_, i) => (
                    <a
                      key={`${row.id}-${i}`}
                      href={signedCleaningPhotoUrl(row.id, i)}
                      target="_blank"
                      rel="noreferrer"
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-sand/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={signedCleaningPhotoUrl(row.id, i)}
                        alt={t("photoOpen")}
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
