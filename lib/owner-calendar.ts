import { connection } from "next/server";
import type { BookingConfig, DateRange } from "@/lib/booking";
import { mergeDateRanges } from "@/lib/booking";
import { getLogement } from "@/lib/logements";
import { paidRangesForSlug } from "@/lib/paid-stays";
import { getStaysForSlug } from "@/lib/owner-data";
import { getOwnerBlockedRanges } from "@/lib/owner-store";
import type { PaidStay } from "@/lib/owner-types";

/**
 * Source unique des nuits bloquées (calendrier public + espace membre) :
 * config statique + séjours démo + Stripe (si configuré) + blocages proprio.
 */
export async function getEffectiveBlockedRanges(slug: string): Promise<DateRange[]> {
  await connection();
  const logement = getLogement(slug);
  const staticBlocked = logement?.booking?.blocked ?? [];
  const owner = await getOwnerBlockedRanges(slug);
  const seedPaid = (await getStaysForSlug(slug)).map((stay) => ({ from: stay.checkIn, to: stay.checkOut }));
  let stripePaid: DateRange[] = [];
  try {
    stripePaid = await paidRangesForSlug(slug);
  } catch {
    stripePaid = [];
  }
  return mergeDateRanges([...staticBlocked, ...owner, ...seedPaid, ...stripePaid]);
}

export async function getBookingWithAvailability(slug: string): Promise<BookingConfig | null> {
  const logement = getLogement(slug);
  if (!logement?.booking) return null;
  const blocked = await getEffectiveBlockedRanges(slug);
  return { ...logement.booking, blocked };
}

export async function getOwnerCalendarPayload(slug: string) {
  await connection();
  const logement = getLogement(slug);
  const ownerBlocks = await getOwnerBlockedRanges(slug);
  const stays = await getStaysForSlug(slug);
  let stripePaid: DateRange[] = [];
  try {
    stripePaid = await paidRangesForSlug(slug);
  } catch {
    stripePaid = [];
  }
  return {
    stays,
    ownerBlocks,
    stripePaid,
    closedMmdd: logement?.booking?.closedMmdd ?? null,
    staticBlocked: [...(logement?.booking?.blocked ?? [])],
  };
}

export function stayCoversNight(stay: PaidStay, iso: string) {
  return iso >= stay.checkIn && iso < stay.checkOut;
}
