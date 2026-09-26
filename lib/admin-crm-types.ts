export const CRM_ZONES = ["porto-vecchio", "santa-giulia", "palombaggia", "other"] as const;
export const CRM_SOURCES = ["door", "airbnb", "instagram", "partner", "market", "web", "other"] as const;
export const CRM_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "visit",
  "quote",
  "negotiation",
  "won",
  "lost",
] as const;
export const CRM_ROLES = ["checkin", "cleaning", "both", "field", "office", "other"] as const;

export type CrmZone = (typeof CRM_ZONES)[number];
export type CrmSource = (typeof CRM_SOURCES)[number];
export type CrmStatus = (typeof CRM_STATUSES)[number];
export type CrmRole = (typeof CRM_ROLES)[number];

export type CrmClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  zone: string;
  property: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type CrmEmployee = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CrmProspectLog = {
  id: string;
  prospectId: string;
  status: string;
  message: string;
  at: string;
};

export type CrmProspect = {
  id: string;
  name: string;
  email: string;
  phone: string;
  zone: string;
  property: string;
  source: string;
  status: string;
  nextFollowUp: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  log: CrmProspectLog[];
};
