"use client";

import { canLeaveAdminSection } from "@/lib/admin-navigation";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import AdminCommercialAssistant from "@/components/owner/AdminCommercialAssistant";
import AdminCrmDesk from "@/components/owner/AdminCrmDesk";
import AdminDashboard from "@/components/owner/AdminDashboard";
import AdminDesk from "@/components/owner/AdminDesk";
import AdminPilotage from "@/components/owner/AdminPilotage";
import AdminHistory from "@/components/owner/AdminHistory";
import StaffOpsDesk from "@/components/owner/StaffOpsDesk";

type Villa = { slug: string; copyKey: string; guests: number };
type Tab = "assistant" | "pilotage" | "dashboard" | "owners" | "planning" | "ops" | "history" | "crm";

export default function AdminWorkspace({ villas }: { villas: readonly Villa[] }) {
  const t = useTranslations("Admin");
  const [tab, setTab] = useState<Tab>("pilotage");

  const tabs = useMemo(
    () =>
      [
        { id: "pilotage" as const, label: t("tabPilotage") },
        { id: "assistant" as const, label: t("tabAssistant") },
        { id: "dashboard" as const, label: t("tabDashboard") },
        { id: "crm" as const, label: t("tabCrm") },
        { id: "owners" as const, label: t("tabOwners") },
        { id: "planning" as const, label: t("tabPlanning") },
        { id: "ops" as const, label: t("tabOps") },
        { id: "history" as const, label: t("tabHistory") },
      ],
    [t],
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 rounded-2xl sm:flex sm:overflow-x-auto border border-sand/40 bg-white p-1 shadow-card">
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { if (canLeaveAdminSection()) setTab(item.id); }}
              className={`min-h-11 rounded-xl px-3 py-2.5 sm:whitespace-nowrap sm:px-4 text-sm font-medium transition-colors ${
                active ? "bg-lagoon text-white" : "text-foreground/70 hover:bg-sand-light hover:text-lagoon-dark"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === "pilotage" ? <AdminPilotage onOpenCrm={() => setTab("crm")} onOpenPlanning={() => setTab("planning")} /> : null}
        {tab === "assistant" ? <AdminCommercialAssistant onOpenCrm={() => setTab("crm")} onOpenInbox={() => setTab("pilotage")} /> : null}
        {tab === "dashboard" ? <AdminDashboard villas={villas} onOpenTab={setTab} /> : null}
        {tab === "crm" ? (
          <div>
            <p className="mb-4 text-sm text-foreground/70">{t("crmLead")}</p>
            <AdminCrmDesk onOpenOwners={() => setTab("owners")} />
          </div>
        ) : null}
        {tab === "owners" ? (
          <div>
            <p className="mb-4 text-sm text-foreground/70">{t("deskLead")}</p>
            <AdminDesk />
          </div>
        ) : null}
        {tab === "planning" ? (
          <div>
            <p className="mb-4 text-sm text-foreground/70">{t("planningLead")}</p>
            <StaffOpsDesk villas={villas} allowBooking allowBlock showOps={false} />
          </div>
        ) : null}
        {tab === "ops" ? (
          <div>
            <p className="mb-4 text-sm text-foreground/70">{t("opsLead")}</p>
            <StaffOpsDesk villas={villas} showCalendar={false} showHistory={false} />
          </div>
        ) : null}
        {tab === "history" ? (
          <div>
            <p className="mb-4 text-sm text-foreground/70">{t("historyLead")}</p>
            <AdminHistory villas={villas} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
