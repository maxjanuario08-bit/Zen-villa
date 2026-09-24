"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import OwnerCalendar from "@/components/owner/OwnerCalendar";
import StaffOps from "@/components/owner/StaffOps";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";
import type { DateRange } from "@/lib/booking";

type Villa = { slug: string; copyKey: string; guests: number };

type CalendarPayload = {
  stays: PaidStay[];
  ownerBlocks: DateRange[];
  closedMmdd: { from: string; to: string } | null;
};

export default function StaffOpsDesk({
  villas,
  allowBooking = false,
  allowBlock = false,
  showCalendar = true,
  showOps = true,
  showHistory = true,
}: {
  villas: readonly Villa[];
  allowBooking?: boolean;
  allowBlock?: boolean;
  showCalendar?: boolean;
  showOps?: boolean;
  showHistory?: boolean;
}) {
  const t = useTranslations("Equipe");
  const tLog = useTranslations("Logements");
  const [slug, setSlug] = useState(villas[0]?.slug ?? "");
  const [stays, setStays] = useState<PaidStay[]>([]);
  const [cleanings, setCleanings] = useState<CleaningRecord[]>([]);
  const [calendar, setCalendar] = useState<CalendarPayload | null>(null);
  const [error, setError] = useState(false);
  const villa = villas.find((item) => item.slug === slug);

  const load = useCallback(async () => {
    if (!slug) return;
    setError(false);
    try {
      const [stayRes, cleanRes, calRes] = await Promise.all([
        fetch(`/api/owner/stays?slug=${encodeURIComponent(slug)}`, { credentials: "include" }),
        fetch(`/api/owner/cleanings?slug=${encodeURIComponent(slug)}`, { credentials: "include" }),
        fetch(`/api/owner/calendar?slug=${encodeURIComponent(slug)}`, { credentials: "include" }),
      ]);
      if (!stayRes.ok || !cleanRes.ok || !calRes.ok) {
        setError(true);
        return;
      }
      const stayData = (await stayRes.json()) as { stays: PaidStay[] };
      const cleanData = (await cleanRes.json()) as { cleanings: CleaningRecord[] };
      const calData = (await calRes.json()) as CalendarPayload;
      setStays(stayData.stays ?? []);
      setCleanings(cleanData.cleanings ?? []);
      setCalendar(calData);
    } catch {
      setError(true);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!villa) return null;

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor="ops-villa" className="mb-1 block text-sm font-medium">
          {t("chooseVilla")}
        </label>
        <select
          id="ops-villa"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full max-w-md rounded-xl border border-sand/60 bg-white px-4 py-2.5 outline-none focus:border-lagoon"
        >
          {villas.map((item) => (
            <option key={item.slug} value={item.slug}>
              {tLog(`${item.copyKey}.name`)}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="text-sm text-red-600">{t("loadError")}</p> : null}
      {showCalendar && calendar ? (
        <OwnerCalendar
          slug={slug}
          stays={calendar.stays}
          ownerBlocks={calendar.ownerBlocks}
          closedMmdd={calendar.closedMmdd}
          maxGuests={villa.guests}
          allowBooking={allowBooking}
          allowBlock={allowBlock}
          onUpdated={() => void load()}
          cleanings={cleanings}
        />
      ) : null}
      {showOps ? (
        <StaffOps
          slug={slug}
          stays={stays}
          cleanings={cleanings}
          onChanged={() => void load()}
          showHistory={showHistory}
        />
      ) : null}
    </div>
  );
}
