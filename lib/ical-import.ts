import type { DateRange } from "@/lib/booking";
import { parseIcalBusyRanges } from "@/lib/ical";
import { getIcalImportUrl } from "@/lib/owner-store";

const cache = new Map<string, { at: number; ranges: DateRange[] }>();
const TTL_MS = 15 * 60 * 1000;

export async function importedIcalRanges(slug: string): Promise<DateRange[]> {
  const url = await getIcalImportUrl(slug);
  if (!url) return [];
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.ranges;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Zenvilla-iCal/1.0" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return hit?.ranges ?? [];
    const text = await res.text();
    const ranges = parseIcalBusyRanges(text);
    cache.set(url, { at: Date.now(), ranges });
    return ranges;
  } catch {
    return hit?.ranges ?? [];
  }
}
