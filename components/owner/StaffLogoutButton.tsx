"use client";

import { useTranslations } from "next-intl";
import { clearStaffName } from "@/lib/staff-name";

export default function StaffLogoutButton() {
  const t = useTranslations("Equipe");

  return (
    <form
      action="/api/owner/staff/logout"
      method="post"
      onSubmit={() => {
        clearStaffName();
      }}
    >
      <button
        type="submit"
        className="text-sm font-medium text-foreground/70 transition-colors hover:text-lagoon"
      >
        {t("logout")}
      </button>
    </form>
  );
}
