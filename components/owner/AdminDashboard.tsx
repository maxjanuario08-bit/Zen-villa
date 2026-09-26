"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { todayISO, addDays } from "@/lib/booking";
import { stayStep } from "@/lib/staff-next-step";
import { formatDuration, overlapMs, shiftRange, startOfLocalDay } from "@/lib/shift-hours";
import type { CrmClient, CrmEmployee, CrmProspect } from "@/lib/admin-crm-types";
import type { CleaningRecord, PaidStay, StaffShift } from "@/lib/owner-types";

type Villa = { slug: string; copyKey: string };
type Tab = "dashboard" | "crm" | "owners" | "planning" | "ops" | "history";

function stayName(stay: PaidStay, t: ReturnType<typeof useTranslations>) {
  if (stay.guestLabel) return stay.guestLabel;
  if (["martin", "laurent", "wright", "rossi"].includes(stay.guestKey)) {
    return t(`guests.${stay.guestKey}`);
  }
  return stay.guestKey || "—";
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-sand/40 bg-white p-4 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-lagoon-dark">{value}</p>
      {hint ? <p className="mt-1 text-xs text-foreground/55">{hint}</p> : null}
    </div>
  );
}

export default function AdminDashboard({
  villas,
  onOpenTab,
}: {
  villas: readonly Villa[];
  onOpenTab: (tab: Tab) => void;
}) {
  const t = useTranslations("Admin");
  const tCompte = useTranslations("Compte");
  const tLog = useTranslations("Logements");
  const locale = useLocale();
  const [stays, setStays] = useState<PaidStay[]>([]);
  const [cleanings, setCleanings] = useState<CleaningRecord[]>([]);
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [employees, setEmployees] = useState<CrmEmployee[]>([]);
  const [prospects, setProspects] = useState<CrmProspect[]>([]);
  const [owners, setOwners] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const today = todayISO();
  const weekFrom = addDays(today, -6);
  const stampFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale],
  );
  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeStyle: "short" }),
    [locale],
  );

  const villaName = useCallback(
    (slug: string) => {
      const villa = villas.find((item) => item.slug === slug);
      return villa ? tLog(`${villa.copyKey}.name`) : slug;
    },
    [tLog, villas],
  );

  const load = useCallback(async () => {
    setError(false);
    try {
      const [histRes, crmRes, accRes] = await Promise.all([
        fetch("/api/owner/admin/history", { credentials: "include" }),
        fetch("/api/owner/admin/crm", { credentials: "include" }),
        fetch("/api/owner/admin/accounts", { credentials: "include" }),
      ]);
      if (!histRes.ok || !crmRes.ok) {
        setError(true);
        return;
      }
      const hist = (await histRes.json()) as {
        stays: PaidStay[];
        cleanings: CleaningRecord[];
        shifts: StaffShift[];
      };
      const crm = (await crmRes.json()) as {
        clients: CrmClient[];
        employees: CrmEmployee[];
        prospects: CrmProspect[];
      };
      setStays(hist.stays ?? []);
      setCleanings(hist.cleanings ?? []);
      setShifts(hist.shifts ?? []);
      setClients(crm.clients ?? []);
      setEmployees(crm.employees ?? []);
      setProspects(crm.prospects ?? []);
      if (accRes.ok) {
        const acc = (await accRes.json()) as { accounts?: { id: string }[] };
        setOwners(acc.accounts?.length ?? 0);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const now = Date.now();
  const todayStart = startOfLocalDay(today);
  const todayEnd = todayStart + 86_400_000;
  const weekStart = startOfLocalDay(weekFrom);

  const staffRows = useMemo(() => {
    const map = new Map<
      string,
      { name: string; open: StaffShift | null; todayMs: number; weekMs: number; sessions: number }
    >();
    for (const shift of shifts) {
      const key = shift.name.trim().toLowerCase() || "—";
      const current = map.get(key) ?? {
        name: shift.name.trim() || "—",
        open: null,
        todayMs: 0,
        weekMs: 0,
        sessions: 0,
      };
      const { start, end } = shiftRange(shift.clockInAt, shift.clockOutAt, now);
      current.todayMs += overlapMs(start, end, todayStart, todayEnd);
      current.weekMs += overlapMs(start, end, weekStart, todayEnd);
      if (end >= weekStart) current.sessions += 1;
      if (!shift.clockOutAt && (!current.open || shift.clockInAt > current.open.clockInAt)) {
        current.open = shift;
      }
      map.set(key, current);
    }
    return [...map.values()].sort((a, b) => {
      if (Boolean(a.open) !== Boolean(b.open)) return a.open ? -1 : 1;
      return b.weekMs - a.weekMs;
    });
  }, [now, shifts, todayEnd, todayStart, weekStart]);

  const openShifts = staffRows.filter((row) => row.open);
  const hoursToday = staffRows.reduce((sum, row) => sum + row.todayMs, 0);
  const hoursWeek = staffRows.reduce((sum, row) => sum + row.weekMs, 0);

  const occupied = stays.filter((stay) => stay.checkIn <= today && stay.checkOut > today).length;
  const checkInToday = stays.filter((stay) => stay.checkIn === today).length;
  const checkOutToday = stays.filter((stay) => stay.checkOut === today).length;
  const due = stays
    .map((stay) => ({ stay, step: stayStep(stay, cleanings, today) }))
    .filter(
      (row): row is { stay: PaidStay; step: "checkin" | "checkout" | "clean" } =>
        row.step === "checkin" || row.step === "checkout" || row.step === "clean",
    )
    .sort((a, b) => {
      const order = { clean: 0, checkout: 1, checkin: 2 };
      return order[a.step] - order[b.step];
    });
  const overdueFollowUps = prospects.filter(
    (row) => row.nextFollowUp && row.nextFollowUp < today && row.status !== "won" && row.status !== "lost",
  ).length;
  const openProspects = prospects.filter((row) => row.status !== "won" && row.status !== "lost").length;

  if (loading) return <p className="text-sm text-foreground/70">{t("dashLoading")}</p>;
  if (error) return <p className="text-sm text-red-600">{t("dashError")}</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("dashTitle")}</h2>
        <p className="mt-1 text-sm text-foreground/70">{t("dashLead")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t("dashOnSite")} value={openShifts.length} hint={t("dashOnSiteHint")} />
        <Stat label={t("dashHoursToday")} value={formatDuration(hoursToday)} />
        <Stat label={t("dashHoursWeek")} value={formatDuration(hoursWeek)} hint={t("dashHoursWeekHint")} />
        <Stat label={t("dashOccupied")} value={occupied} hint={t("dashOccupiedHint")} />
        <Stat label={t("dashCheckInToday")} value={checkInToday} />
        <Stat label={t("dashCheckOutToday")} value={checkOutToday} />
        <Stat label={t("dashCleanDue")} value={due.filter((row) => row.step === "clean").length} />
        <Stat
          label={t("dashPipeline")}
          value={openProspects}
          hint={overdueFollowUps ? t("crmOverdue", { count: overdueFollowUps }) : t("dashClients", { count: clients.length })}
        />
      </div>

      <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-serif text-xl font-semibold text-lagoon-dark">{t("dashStaffTitle")}</h3>
            <p className="mt-1 text-sm text-foreground/65">{t("dashStaffLead")}</p>
          </div>
          <button type="button" onClick={() => onOpenTab("history")} className="text-sm font-medium text-lagoon">
            {t("dashSeeHistory")}
          </button>
        </div>
        {staffRows.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("dashStaffEmpty")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-sand/40 text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3 font-medium">{t("dashStaffName")}</th>
                  <th className="py-2 pr-3 font-medium">{t("dashStaffStatus")}</th>
                  <th className="py-2 pr-3 font-medium">{t("dashHoursToday")}</th>
                  <th className="py-2 pr-3 font-medium">{t("dashHoursWeek")}</th>
                  <th className="py-2 font-medium">{t("dashStaffSessions")}</th>
                </tr>
              </thead>
              <tbody>
                {staffRows.map((row) => (
                  <tr key={row.name} className="border-b border-sand/30 last:border-0">
                    <td className="py-3 pr-3 font-medium text-lagoon-dark">{row.name}</td>
                    <td className="py-3 pr-3">
                      {row.open ? (
                        <span className="rounded-full bg-lagoon/10 px-2 py-1 text-xs font-medium text-lagoon-dark">
                          {t("dashOnDuty")} · {villaName(row.open.slug)} · {timeFmt.format(new Date(row.open.clockInAt))}
                        </span>
                      ) : (
                        <span className="text-foreground/55">{t("dashOffDuty")}</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">{formatDuration(row.todayMs)}</td>
                    <td className="py-3 pr-3">{formatDuration(row.weekMs)}</td>
                    <td className="py-3">{row.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="font-serif text-xl font-semibold text-lagoon-dark">{t("dashTodayOps")}</h3>
          <button type="button" onClick={() => onOpenTab("ops")} className="text-sm font-medium text-lagoon">
            {t("dashGoOps")}
          </button>
        </div>
        {due.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t("dashTodayOpsEmpty")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-sand/40">
            {due.map(({ stay, step }) => (
              <li key={stay.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-lagoon-dark">{stayName(stay, tCompte)}</p>
                  <p className="text-sm text-foreground/65">{villaName(stay.slug)}</p>
                </div>
                <span className="rounded-full bg-sand-light px-3 py-1 text-xs font-medium text-lagoon-dark">
                  {step === "checkin" ? t("historyKindIn") : step === "checkout" ? t("historyKindOut") : t("historyKindClean")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onOpenTab("crm")}
          className="rounded-2xl border border-sand/40 bg-white p-4 text-left shadow-card hover:border-lagoon"
        >
          <p className="text-xs uppercase tracking-wide text-muted">{t("tabCrm")}</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-lagoon-dark">{openProspects}</p>
          <p className="mt-1 text-sm text-foreground/60">{t("dashProspectsOpen")}</p>
        </button>
        <button
          type="button"
          onClick={() => onOpenTab("owners")}
          className="rounded-2xl border border-sand/40 bg-white p-4 text-left shadow-card hover:border-lagoon"
        >
          <p className="text-xs uppercase tracking-wide text-muted">{t("tabOwners")}</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-lagoon-dark">{owners}</p>
          <p className="mt-1 text-sm text-foreground/60">{t("dashOwnersHint")}</p>
        </button>
        <button
          type="button"
          onClick={() => onOpenTab("crm")}
          className="rounded-2xl border border-sand/40 bg-white p-4 text-left shadow-card hover:border-lagoon"
        >
          <p className="text-xs uppercase tracking-wide text-muted">{t("tabEmployees")}</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-lagoon-dark">
            {employees.filter((row) => row.active).length}
          </p>
          <p className="mt-1 text-sm text-foreground/60">{t("dashEmployeesHint")}</p>
        </button>
      </div>

      {shifts.slice(0, 8).length ? (
        <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card">
          <h3 className="font-serif text-xl font-semibold text-lagoon-dark">{t("dashRecentShifts")}</h3>
          <ul className="mt-3 divide-y divide-sand/40 text-sm">
            {[...shifts]
              .sort((a, b) => b.clockInAt.localeCompare(a.clockInAt))
              .slice(0, 8)
              .map((row) => {
                const { start, end } = shiftRange(row.clockInAt, row.clockOutAt, now);
                return (
                  <li key={row.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between">
                    <span className="font-medium text-lagoon-dark">
                      {row.name} · {villaName(row.slug)}
                    </span>
                    <span className="text-foreground/65">
                      {stampFmt.format(new Date(row.clockInAt))}
                      {" → "}
                      {row.clockOutAt ? stampFmt.format(new Date(row.clockOutAt)) : t("historyShiftOpen")}
                      {" · "}
                      {formatDuration(end - start)}
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
