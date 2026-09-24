import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

export function stayHasCheckIn(stay: PaidStay) {
  return Boolean(stay.checkedInAt || stay.checkedInBy);
}

export function stayHasCleaning(stay: PaidStay, cleanings: readonly CleaningRecord[]) {
  return cleanings.some(
    (row) =>
      row.stayId === stay.id || (row.date >= stay.checkIn && row.date < stay.checkOut),
  );
}

export function CheckInMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 3.5H5.5A1.5 1.5 0 0 0 4 5v10a1.5 1.5 0 0 0 1.5 1.5H8" strokeLinecap="round" />
      <path d="M10 10h7m0 0-2.5-2.5M17 10l-2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CleanMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className} fill="currentColor">
      <path d="M10 1.8 11 6.2 15.5 7.2 11 8.2 10 12.6 9 8.2 4.5 7.2 9 6.2 10 1.8Z" />
      <path d="M15.2 11.4 15.7 13.4 17.7 13.9 15.7 14.4 15.2 16.4 14.7 14.4 12.7 13.9 14.7 13.4Z" />
      <path d="M4.8 12.2 5.2 13.8 6.8 14.2 5.2 14.6 4.8 16.2 4.4 14.6 2.8 14.2 4.4 13.8Z" />
    </svg>
  );
}
