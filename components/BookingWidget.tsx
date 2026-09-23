"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { CONTACT } from "@/lib/constants";
import type { BookingConfig } from "@/lib/booking";
import {
  addDays,
  fromISODate,
  isNightUnavailable,
  nightlyRate,
  quoteStay,
  rangeIsAvailable,
  toISODate,
  todayISO,
} from "@/lib/booking";

type Props = {
  slug: string;
  name: string;
  maxGuests: number;
  booking: BookingConfig;
};

const FORMSPREE_URL = process.env.NEXT_PUBLIC_FORMSPREE_ID
  ? `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`
  : null;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthCells(cursor: Date): (string | null)[] {
  const first = startOfMonth(cursor);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: startWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(first.getFullYear(), first.getMonth(), day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function inSelectedRange(iso: string, checkIn: string | null, checkOut: string | null) {
  if (!checkIn) return false;
  if (!checkOut) return iso === checkIn;
  return iso >= checkIn && iso < checkOut;
}

export default function BookingWidget({ slug, name, maxGuests, booking }: Props) {
  const t = useTranslations("Logements");
  const locale = useLocale();
  const today = todayISO();
  const [month, setMonth] = useState(() => {
    let cursor = todayISO();
    for (let i = 0; i < 400; i++) {
      if (!isNightUnavailable(cursor, booking) && cursor >= todayISO()) {
        return startOfMonth(fromISODate(cursor));
      }
      cursor = addDays(cursor, 1);
    }
    return startOfMonth(new Date());
  });
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, [locale]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);
  const cells = monthCells(month);
  const fromPrice = Math.min(booking.defaultNightly, ...booking.seasons.map((s) => s.nightly));

  const quote =
    checkIn && checkOut && rangeIsAvailable(checkIn, checkOut, booking)
      ? quoteStay(checkIn, checkOut, booking)
      : null;

  function canCheckIn(iso: string) {
    return iso >= today && !isNightUnavailable(iso, booking);
  }

  function canCheckOut(iso: string, start: string) {
    return iso > start && rangeIsAvailable(start, iso, booking);
  }

  function onDayClick(iso: string) {
    if (!checkIn || checkOut) {
      if (canCheckIn(iso)) {
        setCheckIn(iso);
        setCheckOut(null);
      }
      return;
    }
    if (iso === checkIn) {
      setCheckIn(null);
      setCheckOut(null);
      return;
    }
    if (iso < checkIn) {
      if (canCheckIn(iso)) {
        setCheckIn(iso);
        setCheckOut(null);
      }
      return;
    }
    if (canCheckOut(iso, checkIn)) setCheckOut(iso);
  }

  function validate(data: Record<string, string>) {
    const err: Record<string, string> = {};
    if (!checkIn || !checkOut || !quote) err.dates = t("booking.errDates");
    if (!data.nom?.trim()) err.nom = t("booking.errName");
    if (!data.email?.trim()) err.email = t("booking.errEmail");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) err.email = t("booking.errEmailFmt");
    if (!data.telephone?.trim()) err.telephone = t("booking.errPhone");
    const guests = Number(data.guests);
    if (!guests || guests < 1 || guests > maxGuests) err.guests = t("booking.errGuests", { max: maxGuests });
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as Record<string, string>;
    if (!validate(data) || !checkIn || !checkOut || !quote) return;

    const summary = [
      `Logement: ${name} (${slug})`,
      `Arrivée: ${checkIn}`,
      `Départ: ${checkOut}`,
      `Nuits: ${quote.nights}`,
      `Voyageurs: ${data.guests}`,
      `Hébergement: ${quote.lodging} €`,
      quote.cleaningFee > 0 ? `Ménage: ${quote.cleaningFee} €` : "",
      `Total: ${quote.total} €`,
      data.message ? `Message: ${data.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!FORMSPREE_URL) {
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
        t("booking.mailSubject", { name })
      )}&body=${encodeURIComponent(
        `${t("booking.lblName")}: ${data.nom}\n${t("booking.lblEmail")}: ${data.email}\n${t("booking.lblPhone")}: ${data.telephone}\n\n${summary}`
      )}`;
      setStatus("success");
      return;
    }

    setStatus("loading");
    formData.set("logement", name);
    formData.set("slug", slug);
    formData.set("checkIn", checkIn);
    formData.set("checkOut", checkOut);
    formData.set("nights", String(quote.nights));
    formData.set("total", String(quote.total));
    formData.set("_subject", t("booking.mailSubject", { name }));
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        setCheckIn(null);
        setCheckOut(null);
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const euro = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="rounded-2xl border border-sand/40 bg-white p-5 sm:p-7 shadow-card">
      <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("booking.title")}</h2>
      <p className="mt-1 text-sm text-foreground/70">{t("booking.subtitle")}</p>
      <p className="mt-3 text-lg font-medium text-lagoon-dark">{t("booking.fromPrice", { price: euro(fromPrice) })}</p>

      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-full px-3 py-1 text-sm text-lagoon hover:bg-sand-light" aria-label={t("booking.prevMonth")}>
          ←
        </button>
        <p className="font-medium text-lagoon-dark capitalize">{monthLabel}</p>
        <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-full px-3 py-1 text-sm text-lagoon hover:bg-sand-light" aria-label={t("booking.nextMonth")}>
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
          const past = iso < today;
          const closed = isNightUnavailable(iso, booking);
          const selected = inSelectedRange(iso, checkIn, checkOut);
          const isStart = iso === checkIn;
          const isEnd = checkOut === iso;
          const selectable = checkIn && !checkOut ? canCheckOut(iso, checkIn) || iso === checkIn || (iso < checkIn && canCheckIn(iso)) : canCheckIn(iso);
          const disabled = past || !selectable;
          const rate = nightlyRate(iso, booking);
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onDayClick(iso)}
              className={`min-h-[3.1rem] rounded-lg border px-0.5 py-1 text-center transition-colors ${
                selected || isStart || isEnd
                  ? "border-lagoon bg-lagoon text-white"
                  : disabled
                    ? "cursor-not-allowed border-transparent bg-sand-light/60 text-muted"
                    : "border-sand/40 bg-white hover:border-lagoon/50"
              }`}
            >
              <span className="block text-xs font-medium">{fromISODate(iso).getDate()}</span>
              {!past && !closed && (
                <span className={`block text-[0.6rem] leading-tight ${selected || isStart || isEnd ? "text-white/90" : "text-lagoon"}`}>
                  {rate}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted">{t("booking.legend")}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-sand-light/70 px-3 py-2">
          <p className="text-muted text-xs">{t("booking.checkIn")}</p>
          <p className="font-medium text-lagoon-dark">{checkIn ?? "—"}</p>
        </div>
        <div className="rounded-xl bg-sand-light/70 px-3 py-2">
          <p className="text-muted text-xs">{t("booking.checkOut")}</p>
          <p className="font-medium text-lagoon-dark">{checkOut ?? "—"}</p>
        </div>
      </div>

      {quote && (
        <ul className="mt-4 space-y-1 text-sm text-foreground/90">
          {quote.lines.map((line) => (
            <li key={line.date} className="flex justify-between">
              <span>{line.date}</span>
              <span>{euro(line.amount)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-sand/50 pt-2">
            <span>{t("booking.nights", { count: quote.nights })}</span>
            <span>{euro(quote.lodging)}</span>
          </li>
          {quote.cleaningFee > 0 && (
            <li className="flex justify-between">
              <span>{t("booking.cleaning")}</span>
              <span>{euro(quote.cleaningFee)}</span>
            </li>
          )}
          <li className="flex justify-between pt-1 font-semibold text-lagoon-dark">
            <span>{t("booking.total")}</span>
            <span>{euro(quote.total)}</span>
          </li>
        </ul>
      )}
      {errors.dates && <p className="mt-2 text-sm text-red-600">{errors.dates}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div>
          <label htmlFor="guests" className="mb-1 block text-sm font-medium">
            {t("booking.lblGuests")}
          </label>
          <select id="guests" name="guests" defaultValue={Math.min(2, maxGuests)} className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon">
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {errors.guests && <p className="mt-1 text-sm text-red-600">{errors.guests}</p>}
        </div>
        <div>
          <label htmlFor="nom" className="mb-1 block text-sm font-medium">
            {t("booking.lblName")}
          </label>
          <input id="nom" name="nom" required className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon" />
          {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            {t("booking.lblEmail")}
          </label>
          <input id="email" name="email" type="email" required className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon" />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="telephone" className="mb-1 block text-sm font-medium">
            {t("booking.lblPhone")}
          </label>
          <input id="telephone" name="telephone" type="tel" required className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon" />
          {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium">
            {t("booking.lblMsg")}
          </label>
          <textarea id="message" name="message" rows={3} className="w-full resize-none rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon" />
        </div>
        {status === "success" && <p className="text-sm font-medium text-green-700">{t("booking.success")}</p>}
        {status === "error" && <p className="text-sm text-red-600">{t("booking.error")}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? t("booking.sending") : t("booking.submit")}
        </Button>
        <p className="text-center text-xs text-muted">{t("booking.confirmNote")}</p>
      </form>
    </div>
  );
}
