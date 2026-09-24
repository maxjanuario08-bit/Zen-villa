"use client";

import { useTranslations } from "next-intl";
import {
  CheckInMark,
  CleanMark,
  stayHasCheckIn,
  stayHasCleaning,
} from "@/components/owner/StayStatusMarks";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

type Size = "sm" | "md";

export default function StayStatusBadges({
  stay,
  cleanings,
  size = "md",
  onColor = false,
}: {
  stay: PaidStay;
  cleanings: readonly CleaningRecord[];
  size?: Size;
  onColor?: boolean;
}) {
  const t = useTranslations("Compte");
  const checkIn = stayHasCheckIn(stay);
  const cleaned = stayHasCleaning(stay, cleanings);
  if (!checkIn && !cleaned) return null;

  const icon = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const chip =
    size === "sm"
      ? "gap-0.5 rounded-full px-1 py-0.5"
      : "gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium";
  const tone = onColor
    ? "bg-white/25 text-white"
    : "bg-lagoon/10 text-lagoon-dark";

  return (
    <span className={`inline-flex flex-wrap items-center ${size === "sm" ? "gap-0.5" : "gap-1.5"}`}>
      {checkIn ? (
        <span className={`inline-flex items-center ${chip} ${tone}`} title={t("badgeCheckIn")}>
          <CheckInMark className={icon} />
          {size === "md" ? <span>{t("badgeCheckIn")}</span> : <span className="sr-only">{t("badgeCheckIn")}</span>}
        </span>
      ) : null}
      {cleaned ? (
        <span className={`inline-flex items-center ${chip} ${tone}`} title={t("badgeClean")}>
          <CleanMark className={icon} />
          {size === "md" ? <span>{t("badgeClean")}</span> : <span className="sr-only">{t("badgeClean")}</span>}
        </span>
      ) : null}
    </span>
  );
}
