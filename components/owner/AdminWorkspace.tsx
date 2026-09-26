"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import AdminCrmDesk from "@/components/owner/AdminCrmDesk";
import AdminDashboard from "@/components/owner/AdminDashboard";
import AdminDesk from "@/components/owner/AdminDesk";
import AdminHistory from "@/components/owner/AdminHistory";
import StaffOpsDesk from "@/components/owner/StaffOpsDesk";

type Villa = { slug: string; copyKey: string; guests: number };
type Tab = "dashboard" | "owners" | "planning" | "ops" | "history" | "crm";

export default function AdminWorkspace({ villas }: { villas: readonly Villa[] }) {
  const t = useTranslations("Admin");
  const [tab, setTab] = useState<Tab>("dashboard");

  const tabs = useMemo(
    () =>
      [
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
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-sand/40 bg-white p-1 shadow-card">
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-lagoon text-white" : "text-foreground/70 hover:bg-sand-light hover:text-lagoon-dark"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === "dashboard" ? <AdminDashboard villas={villas} onOpenTab={setTab} /> : null}
        {tab === "crm" ? (
          <div>
            <p className="mb-4 text-sm text-foreground/70">{t("crmLead")}</p>
            <AdminCrmDesk />
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
