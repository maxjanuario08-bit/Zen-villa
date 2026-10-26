"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { canLeaveAdminSection } from "@/lib/admin-navigation";
import ProspectBoard from "@/components/owner/ProspectBoard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { CrmClient, CrmEmployee, CrmProspect } from "@/lib/admin-crm-types";
import { CRM_ROLES, CRM_ZONES } from "@/lib/admin-crm-types";

type Sub = "clients" | "employees" | "prospects";
const field = "w-full rounded-xl border border-sand/60 bg-white px-3 py-2 text-sm outline-none focus:border-lagoon";

export default function AdminCrmDesk({ onOpenOwners }: { onOpenOwners?: () => void }) {
  const t = useTranslations("Admin");
  const [sub, setSub] = useState<Sub>("prospects");
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [employees, setEmployees] = useState<CrmEmployee[]>([]);
  const [prospects, setProspects] = useState<CrmProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
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
      const form = e.currentTarget;
      const data = new FormData(form);
      const payload: Record<string, unknown> = { kind };
      data.forEach((value, key) => {
        payload[key] = String(value);
      });
      if (kind === "employee") payload.active = data.get("active") === "on";
      const ok = await post(payload);
      if (ok) form.reset();
    };
  }

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
            onClick={() => { if (canLeaveAdminSection()) setSub(item.id); }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              sub === item.id ? "bg-lagoon text-white" : "border border-sand/60 bg-white text-foreground/70 hover:border-lagoon"
            }`}
          >
            {item.label}{item.id !== "prospects" ? ` (${item.count})` : ""}
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

      {sub === "prospects" ? <ProspectBoard onOpenOwners={onOpenOwners} /> : null}
    </div>
  );
}
