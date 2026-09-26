export type OwnerSession = {
  email: string;
  name: string;
  logements: string[];
};

export type OwnerAccount = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  logements: string[];
  propertyNote: string;
  createdAt: string;
};

export type PaidStay = {
  id: string;
  slug: string;
  guestKey: string;
  guestLabel?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "paid";
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  checkedInBy?: string;
  checkedOutBy?: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInPhotos?: string[];
  checkOutPhotos?: string[];
  /** owner = saisie proprio ; ops = admin / équipe ; site = voyageur / démo */
  bookedBy?: "owner" | "ops" | "site";
};

export function ownerMayDeleteStay(stay: PaidStay) {
  return stay.bookedBy === "owner";
}

export type CleaningRecord = {
  id: string;
  slug: string;
  stayId: string;
  date: string;
  time: string;
  cleanerId: "marie" | "luca" | string;
  photos: readonly string[];
  notes?: string;
  checklist?: readonly string[];
};

export type StaffShift = {
  id: string;
  slug: string;
  name: string;
  clockInAt: string;
  clockOutAt: string | null;
};

export type OwnerCalendarFile = {
  blocks: Record<string, { from: string; to: string }[]>;
};
