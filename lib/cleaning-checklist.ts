export const CLEANING_CHECKLIST_GROUPS = [
  {
    id: "kitchen",
    items: [
      "fridge",
      "appliances",
      "water",
      "welcome",
      "paperTowel",
      "kitchenTowel",
      "sponge",
      "kitchenBin",
    ],
  },
  {
    id: "bath",
    items: ["bleach", "mirrors", "drain", "whiteBins", "toiletPaper", "towels"],
  },
  {
    id: "beds",
    items: ["linens", "spareLinens"],
  },
  {
    id: "finish",
    items: ["glass", "floors", "binsFinal"],
  },
] as const;

export type CleaningChecklistGroupId = (typeof CLEANING_CHECKLIST_GROUPS)[number]["id"];
export type CleaningChecklistItemId =
  (typeof CLEANING_CHECKLIST_GROUPS)[number]["items"][number];

export const CLEANING_CHECKLIST_IDS: readonly CleaningChecklistItemId[] =
  CLEANING_CHECKLIST_GROUPS.flatMap((group) => [...group.items]);

export function isCompleteChecklist(done: unknown): done is CleaningChecklistItemId[] {
  if (!Array.isArray(done)) return false;
  const set = new Set(done.filter((item): item is string => typeof item === "string"));
  return CLEANING_CHECKLIST_IDS.every((id) => set.has(id));
}

export function parseChecklist(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((item): item is string => typeof item === "string");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
