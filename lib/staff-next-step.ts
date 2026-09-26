import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

export type StayStep = "checkin" | "inhouse" | "checkout" | "clean" | "wait" | "done";

const RANK: Record<StayStep, number> = {
  clean: 0,
  checkout: 1,
  checkin: 2,
  inhouse: 3,
  wait: 4,
  done: 5,
};

export function stayHasCheckOut(stay: PaidStay) {
  return Boolean(stay.checkedOutAt || stay.checkedOutBy);
}

export function stayHasCheckInRecord(stay: PaidStay) {
  return Boolean(stay.checkedInAt || stay.checkedInBy);
}

export function stayStep(stay: PaidStay, cleanings: readonly CleaningRecord[], today: string): StayStep {
  if (!stayHasCheckInRecord(stay)) {
    return stay.checkIn > today ? "wait" : "checkin";
  }
  if (!stayHasCheckOut(stay)) {
    return stay.checkOut > today ? "inhouse" : "checkout";
  }
  const cleaned = cleanings.some((row) => row.stayId === stay.id);
  if (!cleaned) return "clean";
  return "done";
}

export function sortStaysForStaff(
  stays: readonly PaidStay[],
  cleanings: readonly CleaningRecord[],
  today: string,
) {
  return [...stays].sort((a, b) => {
    const stepA = stayStep(a, cleanings, today);
    const stepB = stayStep(b, cleanings, today);
    const rank = RANK[stepA] - RANK[stepB];
    if (rank !== 0) return rank;
    const dayA = stepA === "wait" || stepA === "checkin" ? a.checkIn : a.checkOut;
    const dayB = stepB === "wait" || stepB === "checkin" ? b.checkIn : b.checkOut;
    return dayA.localeCompare(dayB);
  });
}

export function pipelineIndex(step: StayStep) {
  if (step === "wait" || step === "checkin") return 0;
  if (step === "inhouse" || step === "checkout") return 1;
  if (step === "clean") return 2;
  return 3;
}
