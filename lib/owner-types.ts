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
};

export type CleaningRecord = {
  id: string;
  slug: string;
  stayId: string;
  date: string;
  time: string;
  cleanerId: "marie" | "luca" | string;
  photos: readonly string[];
  notes?: string;
};

export type OwnerCalendarFile = {
  blocks: Record<string, { from: string; to: string }[]>;
};
