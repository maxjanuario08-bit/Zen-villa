"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  addDays,
  daysInclusive,
  fromISODate,
  isNightBlocked,
  monthGrid,
  nightsBetween,
  startOfMonth,
  todayISO,
  type DateRange,
} from "@/lib/booking";
import StayVisitRecap from "@/components/owner/StayVisitRecap";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

type ClosedMmdd = { from: string; to: string } | null;

const STAY_COLORS = [
  { bg: "#1f6f6a", fg: "#ffffff" },
  { bg: "#3d7ea6", fg: "#ffffff" },
  { bg: "#c47a3a", fg: "#ffffff" },
  { bg: "#5c6e3a", fg: "#ffffff" },
  { bg: "#7a4e6a", fg: "#ffffff" },
  { bg: "#2f7d62", fg: "#ffffff" },
  { bg: "#4f5d8a", fg: "#ffffff" },
  { bg: "#a85a45", fg: "#ffffff" },
] as const;

function stayColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return STAY_COLORS[hash % STAY_COLORS.length];
}

function stayGuestName(stay: PaidStay, t: ReturnType<typeof useTranslations>) {
  if (stay.guestLabel) return stay.guestLabel;
  if (["martin", "laurent", "wright", "rossi"].includes(stay.guestKey)) {
    return t(`guests.${stay.guestKey}`);
  }
  return stay.guestKey;
}

function stayShortName(name: string) {
  const first = name.trim().split(/\s+/)[0] ?? name;
  return first.length > 8 ? `${first.slice(0, 7)}…` : first;
}

type Props = {
  slug: string;
  stays: readonly PaidStay[];
  ownerBlocks: readonly DateRange[];
  closedMmdd: ClosedMmdd;
  maxGuests: number;
  cleanings?: readonly CleaningRecord[];
  onUpdated?: () => void;
};

function inClosedMmdd(iso: string, closed: ClosedMmdd) {
  if (!closed) return false;
  const value = iso.slice(5);
  if (closed.from <= closed.to) return value >= closed.from && value < closed.to;
  return value >= closed.from || value < closed.to;
}

export default function OwnerCalendar({ slug, stays, ownerBlocks, closedMmdd, maxGuests, cleanings = [], onUpdated }: Props) {
  const t = useTranslations("Compte");
  const locale = useLocale();
  const router = useRouter();
  const today = todayISO();
  const [month, setMonth] = useState(() => startOfMonth(fromISODate(today)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localBlocks, setLocalBlocks] = useState<DateRange[]>([...ownerBlocks]);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [guest, setGuest] = useState("");
  const [guests, setGuests] = useState(2);
  const [showBook, setShowBook] = useState(false);
  const [recap, setRecap] = useState<PaidStay | null>(null);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, [locale]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);
  const cells = monthGrid(month);
  const selected = anchor ? daysInclusive(anchor, end ?? hover ?? anchor) : [];
  const selectedSet = new Set(selected);
  const monthStays = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    const from = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const to = `${y}-${String(m + 1).padStart(2, "0")}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, "0")}`;
    return stays.filter((stay) => stay.checkIn <= to && stay.checkOut > from);
  }, [month, stays]);

  function stayOn(iso: string) {
    return stays.find((stay) => iso >= stay.checkIn && iso < stay.checkOut);
  }

  function pick(iso: string) {
    const rented = stayOn(iso);
    if (rented) {
      setRecap(rented);
      setAnchor(null);
      setEnd(null);
      setHover(null);
      setShowBook(false);
      return;
    }
    if (inClosedMmdd(iso, closedMmdd) || saving) return;
    setRecap(null);
    setError(null);
    if (!anchor || end) {
      setAnchor(iso);
      setEnd(null);
      setHover(iso);
      setShowBook(false);
      return;
    }
    setEnd(iso);
    setHover(iso);
  }

  async function apply(action: "block" | "unblock") {
    if (!anchor) return;
    const last = end ?? anchor;
    const from = anchor <= last ? anchor : last;
    const to = addDays(anchor <= last ? last : anchor, 1);
    const nights = daysInclusive(from, addDays(to, -1));
    if (nights.some((night) => stayOn(night))) {
      setError(t("calRented"));
      return;
    }
    setSaving(true);
    setError(null);
    const previous = localBlocks;
    try {
      const res = await fetch("/api/owner/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, from, to, action }),
      });
      const data = (await res.json()) as { error?: string; blocks?: DateRange[] };
      if (!res.ok) {
        setLocalBlocks(previous);
        setError(data.error === "rented" ? t("calRented") : t("calError"));
        return;
      }
      if (data.blocks) setLocalBlocks(data.blocks);
      setAnchor(null);
      setEnd(null);
      setHover(null);
      setShowBook(false);
      router.refresh();
      onUpdated?.();
    } catch {
      setLocalBlocks(previous);
      setError(t("calError"));
    } finally {
      setSaving(false);
    }
  }

  async function bookRange() {
    if (!anchor) return;
    const last = end ?? anchor;
    const checkIn = anchor <= last ? anchor : last;
    const checkOut = addDays(anchor <= last ? last : anchor, 1);
    if (!guest.trim()) {
      setShowBook(true);
      setError(t("bookGuestNeed"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/stays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          guestLabel: guest.trim(),
          checkIn,
          checkOut,
          guests,
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
      setAnchor(null);
      setEnd(null);
      setHover(null);
      setGuest("");
      setShowBook(false);
      router.refresh();
      onUpdated?.();
    } catch {
      setError(t("bookError"));
    } finally {
      setSaving(false);
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
          const picked = selectedSet.has(iso);
          const disabled = Boolean(closed || saving);
          const guestName = stay ? stayGuestName(stay, t) : "";
          const tint = stay ? stayColor(stay.id) : null;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              title={stay && guestName ? t("stayGuest", { guest: guestName }) : undefined}
              onClick={() => pick(iso)}
              onMouseEnter={() => {
                if (anchor && !end && !stay && !disabled) setHover(iso);
              }}
              className={`min-h-[3.35rem] rounded-lg border px-0.5 py-1 text-center text-xs transition-colors ${
                stay
                  ? "border-transparent hover:brightness-110"
                  : picked
                    ? "border-lagoon bg-lagoon/15 text-lagoon-dark"
                    : owner
                      ? "border-accent/50 bg-accent/20 text-lagoon-dark hover:bg-accent/30"
                      : closed
                        ? "cursor-not-allowed border-transparent bg-sand-light/70 text-muted"
                        : "border-sand/40 bg-white hover:border-lagoon/50"
              }`}
              style={tint ? { backgroundColor: tint.bg, color: tint.fg } : undefined}
            >
              <span className="block font-medium">{fromISODate(iso).getDate()}</span>
              {stay ? (
                <span className="mt-0.5 block truncate text-[0.58rem] font-medium leading-tight opacity-95">
                  {stayShortName(guestName)}
                </span>
              ) : null}
              {owner && !stay && <span className="block text-[0.55rem] leading-tight">■</span>}
            </button>
          );
        })}
      </div>

      {monthStays.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {monthStays.map((stay) => {
            const tint = stayColor(stay.id);
            return (
              <li key={stay.id}>
                <button
                  type="button"
                  onClick={() => {
                    setRecap(stay);
                    setAnchor(null);
                    setEnd(null);
                    setShowBook(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium text-white"
                  style={{ backgroundColor: tint.bg }}
                >
                  {stayGuestName(stay, t)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {recap ? (
        <div
          className="mt-4 rounded-xl bg-lagoon/10 p-4 text-sm text-lagoon-dark"
          style={{ borderLeft: `6px solid ${stayColor(recap.id).bg}` }}
        >
          <p className="font-medium">
            {t("stayGuest", {
              guest: stayGuestName(recap, t),
            })}
          </p>
          <p className="mt-1 text-foreground/80">
            {t("calRecapDates", { from: recap.checkIn, to: recap.checkOut })}
          </p>
          <p className="mt-1 text-foreground/80">
            {t("calRecapNights", { count: nightsBetween(recap.checkIn, recap.checkOut).length })}
            {" · "}
            {t("bookGuestsCount", { count: recap.guests })}
          </p>
          <StayVisitRecap stay={recap} cleanings={cleanings} />
        </div>
      ) : null}

      {selected.length > 0 ? (
        <div className="mt-4 space-y-3 rounded-xl bg-sand-light/80 p-4">
          <p className="text-sm font-medium text-lagoon-dark">
            {t("calSelected", { from: selected[0], to: selected[selected.length - 1], count: selected.length })}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void apply("block")}
              className="rounded-full bg-lagoon px-4 py-2 text-sm font-medium text-white hover:bg-lagoon-dark disabled:opacity-60"
            >
              {t("calBlock")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void apply("unblock")}
              className="rounded-full border border-lagoon px-4 py-2 text-sm font-medium text-lagoon hover:bg-lagoon hover:text-white disabled:opacity-60"
            >
              {t("calUnblock")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowBook(true)}
              className="rounded-full bg-sand-dark px-4 py-2 text-sm font-medium text-foreground hover:bg-sand disabled:opacity-60"
            >
              {t("calBook")}
            </button>
            <button
              type="button"
              onClick={() => {
                setAnchor(null);
                setEnd(null);
                setHover(null);
                setShowBook(false);
              }}
              className="rounded-full px-4 py-2 text-sm text-foreground/60 hover:text-lagoon-dark"
            >
              {t("calClear")}
            </button>
          </div>
          {showBook ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_6rem_auto]">
              <input
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder={t("bookGuest")}
                className="rounded-xl border border-sand/60 px-3 py-2 text-sm outline-none focus:border-lagoon"
              />
              <input
                type="number"
                min={1}
                max={maxGuests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
                className="rounded-xl border border-sand/60 px-3 py-2 text-sm outline-none focus:border-lagoon"
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => void bookRange()}
                className="rounded-full bg-lagoon px-4 py-2 text-sm font-medium text-white hover:bg-lagoon-dark"
              >
                {t("bookSubmit")}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

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
