"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { StaffShift } from "@/lib/owner-types";
import { readStaffName, writeStaffName } from "@/lib/staff-name";

export default function StaffClock({
  slug,
  shifts,
  onChanged,
  defaultName = "",
}: {
  slug: string;
  shifts: readonly StaffShift[];
  onChanged: () => void;
  defaultName?: string;
}) {
  const t = useTranslations("Equipe");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromSession = defaultName.trim();
    setName(fromSession || readStaffName());
    if (fromSession) writeStaffName(fromSession);
  }, [defaultName]);

  const stampFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeStyle: "short" }),
    [locale],
  );

  const open = useMemo(() => {
    const key = name.trim().toLowerCase();
    if (!key) return null;
    return shifts.find((row) => row.name.toLowerCase() === key && !row.clockOutAt) ?? null;
  }, [name, shifts]);

  const punch = useCallback(
    async (action: "in" | "out") => {
      const trimmed = name.trim();
      if (!trimmed) {
        setError(t("clockNeedName"));
        return;
      }
      writeStaffName(trimmed);
      setBusy(true);
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
        setBusy(false);
      }
    },
    [name, onChanged, slug, t],
  );

  return (
    <section
      className={`rounded-2xl border p-4 shadow-card ${
        open ? "border-lagoon bg-lagoon/5" : "border-sand/40 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="clock-name" className="mb-1 block text-sm font-medium">
            {t("clockName")}
          </label>
          <input
            id="clock-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              writeStaffName(e.target.value);
            }}
            placeholder={t("clockNameHint")}
            className="w-full rounded-xl border border-sand/60 bg-white px-4 py-3 text-base outline-none focus:border-lagoon"
          />
        </div>
        {open ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void punch("out")}
            className="w-full rounded-full border-2 border-lagoon px-6 py-3.5 text-base font-semibold text-lagoon hover:bg-lagoon hover:text-white disabled:opacity-60 sm:w-auto sm:min-w-[10rem]"
          >
            {busy ? t("clockSaving") : t("clockOut")}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void punch("in")}
            className="w-full rounded-full bg-lagoon px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-lagoon-dark disabled:opacity-60 sm:w-auto sm:min-w-[10rem]"
          >
            {busy ? t("clockSaving") : t("clockIn")}
          </button>
        )}
      </div>
      {open ? (
        <p className="mt-3 text-sm font-medium text-lagoon-dark">
          {t("clockOpen", { when: stampFmt.format(new Date(open.clockInAt)) })}
        </p>
      ) : (
        <p className="mt-2 text-sm text-foreground/65">{t("clockLeadShort")}</p>
      )}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
