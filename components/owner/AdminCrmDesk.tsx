"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { CrmClient, CrmEmployee, CrmProspect, CrmStatus } from "@/lib/admin-crm-types";
import { CRM_ROLES, CRM_SOURCES, CRM_STATUSES, CRM_ZONES } from "@/lib/admin-crm-types";

type Sub = "clients" | "employees" | "prospects";
const field = "w-full rounded-xl border border-sand/60 bg-white px-3 py-2 text-sm outline-none focus:border-lagoon";

const STATUS_TONE: Record<string, string> = {
  new: "bg-sand-light text-foreground/80",
  contacted: "bg-sky-100 text-sky-900",
  qualified: "bg-indigo-100 text-indigo-900",
  visit: "bg-amber-100 text-amber-900",
  quote: "bg-orange-100 text-orange-900",
  negotiation: "bg-violet-100 text-violet-900",
  won: "bg-emerald-100 text-emerald-900",
  lost: "bg-red-100 text-red-800",
};

export default function AdminCrmDesk() {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [sub, setSub] = useState<Sub>("prospects");
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [employees, setEmployees] = useState<CrmEmployee[]>([]);
  const [prospects, setProspects] = useState<CrmProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CrmStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [logText, setLogText] = useState("");

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/owner/admin/crm", { credentials: "include" });
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = (await res.json()) as {
        clients: CrmClient[];
        employees: CrmEmployee[];
        prospects: CrmProspect[];
      };
      setClients(data.clients ?? []);
      setEmployees(data.employees ?? []);
      setProspects(data.prospects ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/owner/admin/crm", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError(true);
        return false;
      }
      await load();
      return true;
    } catch {
      setError(true);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/owner/admin/crm/item", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) setError(true);
      else await load();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function remove(kind: string, id: string) {
    if (!window.confirm(t("crmDeleteConfirm"))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/owner/admin/crm/item?kind=${kind}&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) setError(true);
      else await load();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  function onCreate(kind: "client" | "employee" | "prospect") {
    return async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const payload: Record<string, unknown> = { kind };
      data.forEach((value, key) => {
        payload[key] = String(value);
      });
      if (kind === "employee") payload.active = data.get("active") === "on";
      const ok = await post(payload);
      if (ok) e.currentTarget.reset();
    };
  }

  const filteredProspects = useMemo(() => {
    const list = statusFilter === "all" ? prospects : prospects.filter((row) => row.status === statusFilter);
    return [...list].sort((a, b) => {
      const af = a.nextFollowUp || "9999";
      const bf = b.nextFollowUp || "9999";
      return af.localeCompare(bf) || b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [prospects, statusFilter]);

  const overdue = prospects.filter(
    (row) => row.nextFollowUp && row.nextFollowUp < new Date().toISOString().slice(0, 10) && row.status !== "won" && row.status !== "lost",
  ).length;

  const tabs: { id: Sub; label: string; count: number }[] = [
    { id: "prospects", label: t("tabCrm"), count: prospects.filter((p) => p.status !== "won" && p.status !== "lost").length },
    { id: "clients", label: t("tabClients"), count: clients.length },
    { id: "employees", label: t("tabEmployees"), count: employees.filter((e) => e.active).length },
  ];

  if (loading) return <p className="text-sm text-foreground/70">{t("crmLoading")}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSub(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              sub === item.id ? "bg-lagoon text-white" : "border border-sand/60 bg-white text-foreground/70 hover:border-lagoon"
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-red-600">{t("actionError")}</p> : null}

      {sub === "clients" ? (
        <>
          <p className="text-sm text-foreground/70">{t("crmClientsLead")}</p>
          <Card hover={false}>
            <form onSubmit={onCreate("client")} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="name" required minLength={2} placeholder={t("crmName")} className={field} />
              <input name="phone" placeholder={t("crmPhone")} className={field} />
              <input name="email" type="email" placeholder={t("email")} className={field} />
              <select name="zone" className={field} defaultValue="porto-vecchio">
                {CRM_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {t(`crmZone.${zone}`)}
                  </option>
                ))}
              </select>
              <input name="property" placeholder={t("crmProperty")} className={`sm:col-span-2 ${field}`} />
              <input name="address" placeholder={t("crmAddress")} className={`sm:col-span-2 ${field}`} />
              <textarea name="notes" placeholder={t("crmNotes")} rows={2} className={`sm:col-span-2 ${field}`} />
              <Button type="submit" variant="primary" disabled={busy} className="sm:col-span-2">
                {t("crmAddClient")}
              </Button>
            </form>
          </Card>
          {clients.length === 0 ? (
            <p className="text-sm text-muted">{t("crmClientsEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {clients.map((row) => (
                <li key={row.id}>
                  <Card hover={false}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-lagoon-dark">{row.name}</p>
                        <p className="text-sm text-foreground/70">
                          {[row.phone, row.email, t(`crmZone.${row.zone}` as "crmZone.other")].filter(Boolean).join(" · ")}
                        </p>
                        {row.property ? <p className="text-sm text-foreground/80">{row.property}</p> : null}
                        {row.address ? <p className="text-sm text-foreground/65">{row.address}</p> : null}
                        {row.notes ? <p className="mt-2 text-sm text-foreground/75">{row.notes}</p> : null}
                      </div>
                      <button type="button" className="text-sm text-foreground/50 hover:text-red-700" onClick={() => void remove("client", row.id)}>
                        {t("crmDelete")}
                      </button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}

      {sub === "employees" ? (
        <>
          <p className="text-sm text-foreground/70">{t("crmEmployeesLead")}</p>
          <Card hover={false}>
            <form onSubmit={onCreate("employee")} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="name" required minLength={2} placeholder={t("crmName")} className={field} />
              <select name="role" className={field} defaultValue="both">
                {CRM_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`crmRole.${role}`)}
                  </option>
                ))}
              </select>
              <input name="phone" placeholder={t("crmPhone")} className={field} />
              <input name="email" type="email" placeholder={t("email")} className={field} />
              <textarea name="notes" placeholder={t("crmNotes")} rows={2} className={`sm:col-span-2 ${field}`} />
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input name="active" type="checkbox" defaultChecked className="accent-lagoon" />
                {t("crmActive")}
              </label>
              <Button type="submit" variant="primary" disabled={busy} className="sm:col-span-2">
                {t("crmAddEmployee")}
              </Button>
            </form>
          </Card>
          {employees.length === 0 ? (
            <p className="text-sm text-muted">{t("crmEmployeesEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {employees.map((row) => (
                <li key={row.id}>
                  <Card hover={false}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-lagoon-dark">
                          {row.name}
                          {!row.active ? <span className="ml-2 text-xs font-normal text-foreground/50">({t("crmInactive")})</span> : null}
                        </p>
                        <p className="text-sm text-foreground/70">
                          {t(`crmRole.${row.role}` as "crmRole.other")}
                          {row.phone ? ` · ${row.phone}` : ""}
                          {row.email ? ` · ${row.email}` : ""}
                        </p>
                        {row.notes ? <p className="mt-2 text-sm text-foreground/75">{row.notes}</p> : null}
                      </div>
                      <div className="flex gap-3 text-sm">
                        <button
                          type="button"
                          className="text-lagoon hover:text-lagoon-dark"
                          onClick={() => void patch({ kind: "employee", id: row.id, active: !row.active })}
                        >
                          {row.active ? t("crmSetInactive") : t("crmSetActive")}
                        </button>
                        <button type="button" className="text-foreground/50 hover:text-red-700" onClick={() => void remove("employee", row.id)}>
                          {t("crmDelete")}
                        </button>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}

      {sub === "prospects" ? (
        <>
          <p className="text-sm text-foreground/70">{t("crmProspectsLead")}</p>
          {overdue > 0 ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t("crmOverdue", { count: overdue })}
            </p>
          ) : null}
          <Card hover={false}>
            <form onSubmit={onCreate("prospect")} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="name" required minLength={2} placeholder={t("crmName")} className={field} />
              <input name="phone" placeholder={t("crmPhone")} className={field} />
              <input name="email" type="email" placeholder={t("email")} className={field} />
              <input name="property" placeholder={t("crmProperty")} className={field} />
              <select name="zone" className={field} defaultValue="porto-vecchio">
                {CRM_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {t(`crmZone.${zone}`)}
                  </option>
                ))}
              </select>
              <select name="source" className={field} defaultValue="door">
                {CRM_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {t(`crmSource.${source}`)}
                  </option>
                ))}
              </select>
              <select name="status" className={field} defaultValue="new">
                {CRM_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`crmStatus.${status}`)}
                  </option>
                ))}
              </select>
              <input name="nextFollowUp" type="date" className={field} />
              <textarea name="notes" placeholder={t("crmNotes")} rows={2} className={`sm:col-span-2 ${field}`} />
              <Button type="submit" variant="primary" disabled={busy} className="sm:col-span-2">
                {t("crmAddProspect")}
              </Button>
            </form>
          </Card>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusFilter === "all" ? "bg-lagoon text-white" : "border border-sand/60"}`}
            >
              {t("historyFilterAll")}
            </button>
            {CRM_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  statusFilter === status ? "bg-lagoon text-white" : `border border-sand/50 ${STATUS_TONE[status]}`
                }`}
              >
                {t(`crmStatus.${status}`)} ({prospects.filter((p) => p.status === status).length})
              </button>
            ))}
          </div>
          {filteredProspects.length === 0 ? (
            <p className="text-sm text-muted">{t("crmProspectsEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {filteredProspects.map((row) => {
                const late = Boolean(
                  row.nextFollowUp &&
                    row.nextFollowUp < new Date().toISOString().slice(0, 10) &&
                    row.status !== "won" &&
                    row.status !== "lost",
                );
                return (
                  <li key={row.id}>
                    <Card hover={false}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-2 font-medium text-lagoon-dark">
                            {row.name}
                            <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${STATUS_TONE[row.status] ?? ""}`}>
                              {t(`crmStatus.${row.status}` as "crmStatus.new")}
                            </span>
                          </p>
                          <p className="text-sm text-foreground/70">
                            {[row.phone, row.email, t(`crmZone.${row.zone}` as "crmZone.other"), t(`crmSource.${row.source}` as "crmSource.other")]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {row.property ? <p className="text-sm">{row.property}</p> : null}
                          {row.nextFollowUp ? (
                            <p className={`mt-1 text-sm ${late ? "font-medium text-amber-800" : "text-foreground/65"}`}>
                              {t("crmFollowUp")}: {dateFmt.format(new Date(`${row.nextFollowUp}T12:00:00`))}
                              {late ? ` · ${t("crmLate")}` : ""}
                            </p>
                          ) : null}
                          {row.notes ? <p className="mt-2 text-sm text-foreground/75">{row.notes}</p> : null}
                        </div>
                        <div className="flex min-w-[11rem] flex-col gap-2">
                          <select
                            className={field}
                            value={row.status}
                            disabled={busy}
                            onChange={(e) => void patch({ kind: "prospect", id: row.id, status: e.target.value })}
                          >
                            {CRM_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {t(`crmStatus.${status}`)}
                              </option>
                            ))}
                          </select>
                          <input
                            type="date"
                            className={field}
                            value={row.nextFollowUp}
                            onChange={(e) => void patch({ kind: "prospect", id: row.id, nextFollowUp: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <button type="button" className="text-lagoon hover:text-lagoon-dark" onClick={() => setOpenId(openId === row.id ? null : row.id)}>
                          {openId === row.id ? t("crmHideLog") : t("crmShowLog")}
                        </button>
                        {row.status !== "won" ? (
                          <button type="button" className="text-lagoon hover:text-lagoon-dark" onClick={() => void post({ kind: "convert", id: row.id })}>
                            {t("crmConvert")}
                          </button>
                        ) : null}
                        <button type="button" className="text-foreground/50 hover:text-red-700" onClick={() => void remove("prospect", row.id)}>
                          {t("crmDelete")}
                        </button>
                      </div>
                      {openId === row.id ? (
                        <div className="mt-3 border-t border-sand/40 pt-3">
                          <form
                            className="flex flex-col gap-2 sm:flex-row"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const message = logText.trim();
                              if (!message) return;
                              void post({ kind: "log", id: row.id, status: row.status, message }).then((ok) => {
                                if (ok) setLogText("");
                              });
                            }}
                          >
                            <input
                              value={logText}
                              onChange={(e) => setLogText(e.target.value)}
                              placeholder={t("crmLogPlaceholder")}
                              className={`flex-1 ${field}`}
                            />
                            <Button type="submit" variant="outline" disabled={busy}>
                              {t("crmAddLog")}
                            </Button>
                          </form>
                          <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                            {row.log.map((item) => (
                              <li key={item.id}>
                                <span className="text-foreground/50">
                                  {dateFmt.format(new Date(item.at))}
                                  {item.status ? ` · ${t(`crmStatus.${item.status}` as "crmStatus.new")}` : ""}
                                  {" — "}
                                </span>
                                {item.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}
