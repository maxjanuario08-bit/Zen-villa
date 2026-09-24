import { promises as fs } from "fs";
import path from "path";
import { addDays, isNightBlocked, mergeDateRanges, type DateRange } from "@/lib/booking";
import { ownerDemoEnabled } from "@/lib/owner-config";
import { pg, usePostgres } from "@/lib/owner-pg";
import { SEED_OWNER_BLOCKS } from "@/lib/owner-seed";
import type { OwnerCalendarFile } from "@/lib/owner-types";

const STORE_PATH = path.join(process.cwd(), "data", "owner-calendar.json");

async function readFile(): Promise<OwnerCalendarFile | null> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as OwnerCalendarFile;
    if (!parsed || typeof parsed !== "object" || !parsed.blocks) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeFile(data: OwnerCalendarFile) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeRanges(ranges: readonly DateRange[] | undefined): DateRange[] {
  if (!ranges) return [];
  return mergeDateRanges(
    ranges.filter((r) => typeof r.from === "string" && typeof r.to === "string" && r.to > r.from),
  );
}

function parseBlocks(raw: unknown): DateRange[] {
  if (typeof raw !== "string") return [];
  try {
    return normalizeRanges(JSON.parse(raw) as DateRange[]);
  } catch {
    return [];
  }
}

async function seedDefaultsIfEmpty(slug: string, current: DateRange[]): Promise<DateRange[]> {
  if (current.length || !ownerDemoEnabled()) return current;
  return normalizeRanges(SEED_OWNER_BLOCKS[slug]);
}

export async function getOwnerBlockedRanges(slug: string): Promise<DateRange[]> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`SELECT blocks_json FROM owner_calendar WHERE slug = ${slug} LIMIT 1`;
    const raw = rows[0] as { blocks_json?: string } | undefined;
    if (raw?.blocks_json) return parseBlocks(raw.blocks_json);
    return seedDefaultsIfEmpty(slug, []);
  }
  const file = await readFile();
  if (file) return normalizeRanges(file.blocks[slug]);
  return seedDefaultsIfEmpty(slug, []);
}

export async function getAllOwnerBlocks(): Promise<Record<string, DateRange[]>> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`SELECT slug, blocks_json FROM owner_calendar`;
    const out: Record<string, DateRange[]> = {};
    for (const row of rows as { slug: string; blocks_json: string }[]) {
      out[row.slug] = parseBlocks(row.blocks_json);
    }
    return out;
  }
  const file = await readFile();
  if (file) {
    return Object.fromEntries(
      Object.entries(file.blocks).map(([slug, ranges]) => [slug, normalizeRanges(ranges)]),
    );
  }
  if (!ownerDemoEnabled()) return {};
  return Object.fromEntries(
    Object.entries(SEED_OWNER_BLOCKS).map(([slug, ranges]) => [slug, normalizeRanges(ranges)]),
  );
}

async function persistSlug(slug: string, ranges: DateRange[]) {
  const merged = mergeDateRanges(ranges);
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO owner_calendar (slug, blocks_json)
      VALUES (${slug}, ${JSON.stringify(merged)})
      ON CONFLICT (slug) DO UPDATE SET blocks_json = ${JSON.stringify(merged)}
    `;
    return merged;
  }
  const all = await getAllOwnerBlocks();
  all[slug] = merged;
  await writeFile({ blocks: all });
  return all[slug];
}

export async function addOwnerNight(slug: string, night: string): Promise<DateRange[]> {
  const current = await getOwnerBlockedRanges(slug);
  if (isNightBlocked(night, current)) return current;
  return persistSlug(slug, [...current, { from: night, to: addDays(night, 1) }]);
}

export async function addOwnerRange(slug: string, from: string, to: string): Promise<DateRange[]> {
  const current = await getOwnerBlockedRanges(slug);
  return persistSlug(slug, [...current, { from, to }]);
}

export async function removeOwnerNight(slug: string, night: string): Promise<DateRange[]> {
  const current = await getOwnerBlockedRanges(slug);
  const next: DateRange[] = [];
  for (const range of current) {
    if (!(night >= range.from && night < range.to)) {
      next.push(range);
      continue;
    }
    if (range.from < night) next.push({ from: range.from, to: night });
    const after = addDays(night, 1);
    if (after < range.to) next.push({ from: after, to: range.to });
  }
  return persistSlug(slug, next);
}
