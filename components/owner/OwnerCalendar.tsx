"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  addDays,
  fromISODate,
  isNightBlocked,
  monthGrid,
  startOfMonth,
  todayISO,
  type DateRange,
} from "@/lib/booking";
import type { PaidStay } from "@/lib/owner-types";

type ClosedMmdd = { from: string; to: string } | null;

type Props = {
  slug: string;
  stays: readonly PaidStay[];
  ownerBlocks: readonly DateRange[];
  closedMmdd: ClosedMmdd;
};

function inClosedMmdd(iso: string, closed: ClosedMmdd) {
  if (!closed) return false;
  const value = iso.slice(5);
  if (closed.from <= closed.to) return value >= closed.from && value < closed.to;
  return value >= closed.from || value < closed.to;
}

export default function OwnerCalendar({ slug, stays, ownerBlocks, closedMmdd }: Props) {
  const t = useTranslations("Compte");
  const locale = useLocale();
  const router = useRouter();
  const today = todayISO();
  const [month, setMonth] = useState(() => startOfMonth(fromISODate(today)));
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localBlocks, setLocalBlocks] = useState<DateRange[]>([...ownerBlocks]);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, [locale]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);
  const cells = monthGrid(month);

  function stayOn(iso: string) {
    return stays.find((stay) => iso >= stay.checkIn && iso < stay.checkOut);
  }

  async function toggle(iso: string) {
    if (stayOn(iso) || inClosedMmdd(iso, closedMmdd)) return;
    const blocked = isNightBlocked(iso, localBlocks);
    setSaving(iso);
    setError(null);
    const previous = localBlocks;
    if (blocked) {
      setLocalBlocks((ranges) =>
        ranges.flatMap((range) => {
          if (!(iso >= range.from && iso < range.to)) return [range];
          const next: DateRange[] = [];
          if (range.from < iso) next.push({ from: range.from, to: iso });
          const after = addDays(iso, 1);
          if (after < range.to) next.push({ from: after, to: range.to });
          return next;
        }),
      );
    } else {
      setLocalBlocks((ranges) => [...ranges, { from: iso, to: addDays(iso, 1) }]);
    }
    try {
      const res = await fetch("/api/owner/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, night: iso, action: blocked ? "unblock" : "block" }),
      });
      const data = (await res.json()) as { error?: string; blocks?: DateRange[] };
      if (!res.ok) {
        setLocalBlocks(previous);
        setError(data.error === "rented" ? t("calRented") : t("calError"));
        return;
      }
      if (data.blocks) setLocalBlocks(data.blocks);
      router.refresh();
    } catch {
      setLocalBlocks(previous);
      setError(t("calError"));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="rounded-2xl border border-sand/40 bg-white p-5 sm:p-7 shadow-card">
      <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("calTitle")}</h2>
      <p className="mt-2 text-sm text-foreground/70">{t("calLead")}</p>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="rounded-full px-3 py-1 text-sm text-lagoon hover:bg-sand-light"
          aria-label={t("calPrev")}
        >
          ←
        </button>
        <p className="font-medium text-lagoon-dark capitalize">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="rounded-full px-3 py-1 text-sm text-lagoon hover:bg-sand-light"
          aria-label={t("calNext")}
        >
          →
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.65rem] uppercase tracking-wide text-muted">
        {weekdays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e-${i}`} />;
          const stay = stayOn(iso);
          const owner = isNightBlocked(iso, localBlocks);
          const closed = inClosedMmdd(iso, closedMmdd);
          const past = iso < today;
          const disabled = Boolean(stay || closed || saving);
          const guest =
            stay?.guestLabel ||
            (stay && ["martin", "laurent", "wright", "rossi"].includes(stay.guestKey)
              ? t(`guests.${stay.guestKey}`)
              : stay?.guestKey);
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              title={stay && guest ? t("stayGuest", { guest }) : undefined}
              onClick={() => void toggle(iso)}
              className={`min-h-[3.1rem] rounded-lg border px-0.5 py-1 text-center text-xs transition-colors ${
                stay
                  ? "cursor-not-allowed border-lagoon/30 bg-lagoon text-white"
                  : owner
                    ? "border-accent/50 bg-accent/20 text-lagoon-dark hover:bg-accent/30"
                    : closed
                      ? "cursor-not-allowed border-transparent bg-sand-light/70 text-muted"
                      : past
                        ? "border-sand/30 bg-white text-muted hover:border-lagoon/40"
                        : "border-sand/40 bg-white hover:border-lagoon/50"
              }`}
            >
              <span className="block font-medium">{fromISODate(iso).getDate()}</span>
              {stay && <span className="block text-[0.55rem] leading-tight opacity-90">●</span>}
              {owner && !stay && <span className="block text-[0.55rem] leading-tight">■</span>}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/70">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-sand/50 bg-white" />
          {t("legendAvailable")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-lagoon" />
          {t("legendRented")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent/40" />
          {t("legendOwner")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-sand-light" />
          {t("legendClosed")}
        </li>
      </ul>
      {saving && <p className="mt-3 text-xs text-muted">{t("calSaving")}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
