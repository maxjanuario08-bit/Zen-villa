"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";
import StayStatusBadges from "@/components/owner/StayStatusBadges";
import { ownerMayDeleteStay } from "@/lib/owner-types";

function stayName(stay: PaidStay, t: ReturnType<typeof useTranslations>) {
  if (stay.guestLabel) return stay.guestLabel;
  if (["martin", "laurent", "wright", "rossi"].includes(stay.guestKey)) {
    return t(`guests.${stay.guestKey}`);
  }
  return stay.guestKey;
}

type Props = {
  slug: string;
  stays: readonly PaidStay[];
  cleanings?: readonly CleaningRecord[];
};

export default function OwnerOps({ slug, stays, cleanings = [] }: Props) {
  const t = useTranslations("Compte");
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  function formatDay(iso: string) {
    return dateFmt.format(new Date(`${iso}T12:00:00`));
  }

  async function removeStay(stayId: string) {
    setBusy(`delete:${stayId}`);
    setError(null);
    try {
      const res = await fetch("/api/owner/stays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, stayId, action: "delete" }),
      });
      if (res.status === 403) {
        setError(t("stayDeleteForbidden"));
        return;
      }
      if (!res.ok) {
        setError(t("opsError"));
        return;
      }
      router.refresh();
    } catch {
      setError(t("opsError"));
    } finally {
      setBusy(null);
    }
  }

  const ordered = [...stays].sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("staysOwnerTitle")}</h2>
        <p className="mt-2 text-sm text-foreground/70">{t("staysOwnerLead")}</p>
        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("staysEmpty")}</p>
        ) : (
          <ul className="mt-5 divide-y divide-sand/40">
            {ordered.map((stay) => (
              <li key={stay.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-lagoon-dark">{stayName(stay, t)}</p>
                    <StayStatusBadges stay={stay} cleanings={cleanings} />
                  </div>
                  <p className="text-sm text-foreground/70">
                    {formatDay(stay.checkIn)} → {formatDay(stay.checkOut)} ·{" "}
                    {t("bookGuestsCount", { count: stay.guests })}
                  </p>
                </div>
                {ownerMayDeleteStay(stay) ? (
                  <button
                    type="button"
                    disabled={busy === `delete:${stay.id}`}
                    onClick={() => void removeStay(stay.id)}
                    className="rounded-full px-4 py-1.5 text-sm text-foreground/55 hover:text-red-700"
                  >
                    {t("stayDelete")}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
