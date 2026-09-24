import type { DateRange } from "@/lib/booking";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

/** Propriétaire démo — Mini Villa Pinson. */
export const DEMO_OWNER = {
  name: "Claire Pinson",
  logements: ["mini-villa-pinson"] as const,
};

/** Séjours payés (démo 2026) — source des revenus et du calendrier « loué ». */
export const SEED_PAID_STAYS: readonly PaidStay[] = [
  {
    id: "stay-pinson-2026-04",
    slug: "mini-villa-pinson",
    guestKey: "martin",
    checkIn: "2026-04-08",
    checkOut: "2026-04-15",
    guests: 2,
    status: "paid",
    bookedBy: "site",
  },
  {
    id: "stay-pinson-2026-06",
    slug: "mini-villa-pinson",
    guestKey: "laurent",
    checkIn: "2026-06-18",
    checkOut: "2026-06-25",
    guests: 3,
    status: "paid",
    bookedBy: "site",
  },
  {
    id: "stay-pinson-2026-07",
    slug: "mini-villa-pinson",
    guestKey: "wright",
    checkIn: "2026-07-20",
    checkOut: "2026-07-27",
    guests: 2,
    status: "paid",
    bookedBy: "site",
  },
  {
    id: "stay-pinson-2026-08",
    slug: "mini-villa-pinson",
    guestKey: "rossi",
    checkIn: "2026-08-22",
    checkOut: "2026-08-29",
    guests: 4,
    status: "paid",
    bookedBy: "site",
  },
];

/** Blocages perso initiaux (usage propriétaire). Persistés ensuite dans data/owner-calendar.json. */
export const SEED_OWNER_BLOCKS: Record<string, DateRange[]> = {
  "mini-villa-pinson": [
    { from: "2026-05-10", to: "2026-05-17" },
    { from: "2026-09-08", to: "2026-09-12" },
  ],
};

export const SEED_CLEANINGS: readonly CleaningRecord[] = [
  {
    id: "clean-pinson-2026-04-15",
    slug: "mini-villa-pinson",
    stayId: "stay-pinson-2026-04",
    date: "2026-04-15",
    time: "10:00",
    cleanerId: "marie",
    photos: [
      "/logements/pinson/sejour.jpg",
      "/logements/pinson/chambre.jpg",
      "/logements/pinson/terrasse.jpg",
    ],
  },
  {
    id: "clean-pinson-2026-06-25",
    slug: "mini-villa-pinson",
    stayId: "stay-pinson-2026-06",
    date: "2026-06-25",
    time: "10:30",
    cleanerId: "luca",
    photos: ["/logements/pinson/exterieur.jpg", "/logements/pinson/sejour.jpg"],
  },
  {
    id: "clean-pinson-2026-07-27",
    slug: "mini-villa-pinson",
    stayId: "stay-pinson-2026-07",
    date: "2026-07-27",
    time: "11:00",
    cleanerId: "marie",
    photos: [
      "/logements/pinson/chambre.jpg",
      "/logements/pinson/sejour.jpg",
      "/logements/pinson/exterieur.jpg",
    ],
  },
];

export function seedStaysForSlug(slug: string): PaidStay[] {
  return SEED_PAID_STAYS.filter((stay) => stay.slug === slug);
}

export function seedStayRangesForSlug(slug: string): DateRange[] {
  return seedStaysForSlug(slug).map((stay) => ({ from: stay.checkIn, to: stay.checkOut }));
}

export function seedCleaningsForSlug(slug: string): CleaningRecord[] {
  return SEED_CLEANINGS.filter((row) => row.slug === slug);
}
