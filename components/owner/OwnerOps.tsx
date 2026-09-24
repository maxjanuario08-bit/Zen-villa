"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import type { PaidStay } from "@/lib/owner-types";
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
  maxGuests: number;
  stays: readonly PaidStay[];
};

export default function OwnerOps({ slug, maxGuests, stays }: Props) {
  const t = useTranslations("Compte");
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  function formatDay(iso: string) {
    return dateFmt.format(new Date(`${iso}T12:00:00`));
  }

  async function book(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy("book");
    setError(null);
    try {
      const res = await fetch("/api/owner/stays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          guestLabel: String(data.get("guestLabel") ?? ""),
          checkIn: String(data.get("checkIn") ?? ""),
          checkOut: String(data.get("checkOut") ?? ""),
          guests: Number(data.get("guests") || 1),
        }),
      });
      if (res.status === 409) {
        setError(t("bookOverlap"));
        return;
      }
      if (!res.ok) {
        setError(t("bookError"));
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError(t("bookError"));
    } finally {
      setBusy(null);
    }
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
        <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("bookTitle")}</h2>
        <p className="mt-2 text-sm text-foreground/70">{t("bookLead")}</p>
        <form onSubmit={(e) => void book(e)} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="guestLabel" className="mb-1 block text-sm font-medium">
              {t("bookGuest")}
            </label>
            <input
              id="guestLabel"
              name="guestLabel"
              required
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <label htmlFor="checkIn" className="mb-1 block text-sm font-medium">
              {t("bookIn")}
            </label>
            <input
              id="checkIn"
              name="checkIn"
              type="date"
              required
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <label htmlFor="checkOut" className="mb-1 block text-sm font-medium">
              {t("bookOut")}
            </label>
            <input
              id="checkOut"
              name="checkOut"
              type="date"
              required
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <label htmlFor="guests" className="mb-1 block text-sm font-medium">
              {t("bookGuests")}
            </label>
            <input
              id="guests"
              name="guests"
              type="number"
              min={1}
              max={maxGuests}
              defaultValue={2}
              required
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" className="w-full" disabled={busy === "book"}>
              {busy === "book" ? t("bookSaving") : t("bookSubmit")}
            </Button>
          </div>
        </form>
      </section>

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
                  <p className="font-medium text-lagoon-dark">{stayName(stay, t)}</p>
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
