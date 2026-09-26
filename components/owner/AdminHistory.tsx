"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import StayStatusBadges from "@/components/owner/StayStatusBadges";
import { CheckInMark, CleanMark } from "@/components/owner/StayStatusMarks";
import type { CleaningRecord, PaidStay, StaffShift } from "@/lib/owner-types";

type Villa = { slug: string; copyKey: string };
type Kind = "all" | "checkin" | "checkout" | "clean" | "shift";

type EventRow = {
  id: string;
  kind: Exclude<Kind, "all">;
  at: string;
  slug: string;
  guest: string;
  who: string;
  photos: string[];
  stay: PaidStay | null;
  extra?: string;
};

function stayName(stay: PaidStay, t: ReturnType<typeof useTranslations>) {
  if (stay.guestLabel) return stay.guestLabel;
  if (["martin", "laurent", "wright", "rossi"].includes(stay.guestKey)) {
    return t(`guests.${stay.guestKey}`);
  }
  return stay.guestKey;
}

function cleanerLabel(id: string, t: ReturnType<typeof useTranslations>) {
  if (["marie", "luca"].includes(id)) return t(`cleaners.${id}`);
  return id;
}

function sortStamp(isoDay: string, time?: string | null, stamp?: string | null) {
  if (stamp) return stamp;
  return `${isoDay}T${time && /^\d{2}:\d{2}/.test(time) ? time : "12:00"}:00`;
}

export default function AdminHistory({ villas }: { villas: readonly Villa[] }) {
  const t = useTranslations("Admin");
  const tCompte = useTranslations("Compte");
  const tLog = useTranslations("Logements");
  const locale = useLocale();
  const [stays, setStays] = useState<PaidStay[]>([]);
  const [cleanings, setCleanings] = useState<CleaningRecord[]>([]);
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [kind, setKind] = useState<Kind>("all");
  const [slug, setSlug] = useState("all");

  const stampFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const villaName = useCallback(
    (value: string) => {
      const villa = villas.find((item) => item.slug === value);
      if (!villa) return value;
      return tLog(`${villa.copyKey}.name`);
    },
    [tLog, villas],
  );

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/owner/admin/history", { credentials: "include" });
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = (await res.json()) as { stays: PaidStay[]; cleanings: CleaningRecord[]; shifts: StaffShift[] };
      setStays(data.stays ?? []);
      setCleanings(data.cleanings ?? []);
      setShifts(data.shifts ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const events = useMemo(() => {
    const rows: EventRow[] = [];
    for (const stay of stays) {
      const guest = stayName(stay, tCompte);
      if (stay.checkedInAt || stay.checkedInBy) {
        rows.push({
          id: `${stay.id}-in`,
          kind: "checkin",
          at: sortStamp(stay.checkIn, stay.checkInTime, stay.checkedInAt),
          slug: stay.slug,
          guest,
          who: stay.checkedInBy || "—",
          photos: stay.checkInPhotos ?? [],
          stay,
        });
      }
      if (stay.checkedOutAt || stay.checkedOutBy) {
        rows.push({
          id: `${stay.id}-out`,
          kind: "checkout",
          at: sortStamp(stay.checkOut, stay.checkOutTime, stay.checkedOutAt),
          slug: stay.slug,
          guest,
          who: stay.checkedOutBy || "—",
          photos: stay.checkOutPhotos ?? [],
          stay,
        });
      }
    }
    for (const row of cleanings) {
      const stay = stays.find((item) => item.id === row.stayId) ?? null;
      rows.push({
        id: row.id,
        kind: "clean",
        at: sortStamp(row.date, row.time),
        slug: row.slug,
        guest: stay ? stayName(stay, tCompte) : t("historyNoStay"),
        who: cleanerLabel(row.cleanerId, tCompte),
        photos: [...row.photos],
        stay,
        extra: (row.checklist?.length ?? 0) > 0 ? t("historyChecklistDone") : undefined,
      });
    }
    for (const row of shifts) {
      rows.push({
        id: `shift-${row.id}`,
        kind: "shift",
        at: row.clockInAt,
        slug: row.slug,
        guest: row.clockOutAt
          ? t("historyShiftClosed", { out: stampFmt.format(new Date(row.clockOutAt)) })
          : t("historyShiftOpen"),
        who: row.name,
        photos: [],
        stay: null,
      });
    }
    return rows.sort((a, b) => b.at.localeCompare(a.at));
  }, [cleanings, shifts, stays, t, tCompte, stampFmt]);

  const filtered = events.filter((row) => {
    if (kind !== "all" && row.kind !== kind) return false;
    if (slug !== "all" && row.slug !== slug) return false;
    return true;
  });

  const filters: { id: Kind; label: string }[] = [
    { id: "all", label: t("historyFilterAll") },
    { id: "checkin", label: t("historyFilterIn") },
    { id: "checkout", label: t("historyFilterOut") },
    { id: "clean", label: t("historyFilterClean") },
    { id: "shift", label: t("historyFilterShift") },
  ];

  if (loading) return <p className="text-sm text-foreground/70">{t("historyLoading")}</p>;
  if (error) return <p className="text-sm text-red-600">{t("historyError")}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setKind(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              kind === item.id ? "bg-lagoon text-white" : "border border-sand/60 bg-white text-foreground/70 hover:border-lagoon"
            }`}
          >
            {item.label}
          </button>
        ))}
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-full border border-sand/60 bg-white px-3 py-1.5 text-sm outline-none focus:border-lagoon"
        >
          <option value="all">{t("historyAllVillas")}</option>
          {villas.map((item) => (
            <option key={item.slug} value={item.slug}>
              {tLog(`${item.copyKey}.name`)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">{t("historyEmpty")}</p>
      ) : (
        <ul className="divide-y divide-sand/40 overflow-hidden rounded-2xl border border-sand/40 bg-white shadow-card">
          {filtered.map((row) => (
            <li key={row.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-lagoon-dark">
                  {row.kind === "clean" ? <CleanMark className="h-4 w-4" /> : <CheckInMark className="h-4 w-4" />}
                  {row.kind === "checkin"
                    ? t("historyKindIn")
                    : row.kind === "checkout"
                      ? t("historyKindOut")
                      : row.kind === "shift"
                        ? t("historyKindShift")
                        : t("historyKindClean")}
                  <span className="font-normal text-foreground/55">· {villaName(row.slug)}</span>
                </p>
                <p className="mt-1 text-sm text-foreground/80">
                  {row.guest} · {t("historyBy", { name: row.who })}
                </p>
                {row.stay ? <div className="mt-2"><StayStatusBadges stay={row.stay} cleanings={cleanings} /></div> : null}
                {row.extra ? <p className="mt-1 text-xs text-foreground/60">{row.extra}</p> : null}
                {row.photos.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row.photos.slice(0, 6).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={`${row.id}-${i}`} src={src} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="shrink-0 text-xs text-foreground/55">
                {stampFmt.format(new Date(row.at))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
