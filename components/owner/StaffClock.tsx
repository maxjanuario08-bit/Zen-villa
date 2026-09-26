"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import type { StaffShift } from "@/lib/owner-types";

const NAME_KEY = "zv_staff_name";

export default function StaffClock({
  slug,
  shifts,
  onChanged,
}: {
  slug: string;
  shifts: readonly StaffShift[];
  onChanged: () => void;
}) {
  const t = useTranslations("Equipe");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"in" | "out" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  const stampFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale],
  );

  const open = useMemo(() => {
    const key = name.trim().toLowerCase();
    if (!key) return null;
    return shifts.find((row) => row.name.toLowerCase() === key && !row.clockOutAt) ?? null;
  }, [name, shifts]);

  const recent = shifts.slice(0, 6);

  const punch = useCallback(
    async (action: "in" | "out") => {
      const trimmed = name.trim();
      if (!trimmed) {
        setError(t("clockNeedName"));
        return;
      }
      try {
        localStorage.setItem(NAME_KEY, trimmed);
      } catch {
        /* ignore */
      }
      setBusy(action);
      setError(null);
      try {
        const res = await fetch("/api/owner/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ slug, name: trimmed, action }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error === "none" ? t("clockNone") : t("clockError"));
          return;
        }
        onChanged();
      } catch {
        setError(t("clockError"));
      } finally {
        setBusy(null);
      }
    },
    [name, onChanged, slug, t],
  );

  return (
    <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card sm:p-7">
      <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("clockTitle")}</h2>
      <p className="mt-2 text-sm text-foreground/70">{t("clockLead")}</p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <label htmlFor="clock-name" className="mb-1 block text-sm font-medium">
            {t("clockName")}
          </label>
          <input
            id="clock-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
          />
        </div>
        <Button
          type="button"
          variant="primary"
          className="sm:mt-6"
          disabled={busy !== null}
          onClick={() => void punch("in")}
        >
          {busy === "in" ? t("clockSaving") : t("clockIn")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="sm:mt-6"
          disabled={busy !== null}
          onClick={() => void punch("out")}
        >
          {busy === "out" ? t("clockSaving") : t("clockOut")}
        </Button>
      </div>
      {open ? (
        <p className="mt-3 text-sm font-medium text-lagoon-dark">
          {t("clockOpen", { when: stampFmt.format(new Date(open.clockInAt)) })}
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {recent.length ? (
        <ul className="mt-5 divide-y divide-sand/40 text-sm">
          {recent.map((row) => (
            <li key={row.id} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between">
              <span className="font-medium text-lagoon-dark">{row.name}</span>
              <span className="text-foreground/65">
                {stampFmt.format(new Date(row.clockInAt))}
                {" → "}
                {row.clockOutAt ? stampFmt.format(new Date(row.clockOutAt)) : t("clockStillOpen")}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
