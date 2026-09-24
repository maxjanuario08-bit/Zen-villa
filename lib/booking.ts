export type DateRange = { from: string; to: string };

export type BookingConfig = {
  enabled: boolean;
  currency: "EUR";
  /** Minimum de nuits hors règles mensuelles */
  minNights: number;
  /** Minimums par mois civil (1 = janvier … 12 = décembre) */
  minNightsByMonth?: Partial<Record<number, number>>;
  cleaningFee: number;
  defaultNightly: number;
  /** Saisons : from/to au format MM-DD, nightly en euros */
  seasons: readonly { from: string; to: string; nightly: number }[];
  /** Séjours déjà pris (to = jour de départ, non facturé) */
  blocked: readonly DateRange[];
  /**
   * Fermeture annuelle (MM-DD). `to` exclusif.
   * Ex. 11-02 → 03-03 : dernière nuit le 1er nov., première arrivée le 3 mars.
   */
  closedMmdd?: { from: string; to: string };
};

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Grille lundi→dimanche d’un mois (cellules vides = null). */
export function monthGrid(cursor: Date): (string | null)[] {
  const first = startOfMonth(cursor);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: startWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(first.getFullYear(), first.getMonth(), day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function mergeDateRanges(ranges: readonly DateRange[]): DateRange[] {
  const sorted = [...ranges]
    .filter((r) => r.to > r.from)
    .sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
  const out: DateRange[] = [];
  for (const range of sorted) {
    const last = out.at(-1);
    if (last && range.from <= last.to) {
      if (range.to > last.to) last.to = range.to;
    } else {
      out.push({ from: range.from, to: range.to });
    }
  }
  return out;
}

function mmdd(iso: string): string {
  return iso.slice(5);
}

function inSeason(mmddValue: string, from: string, to: string): boolean {
  if (from <= to) return mmddValue >= from && mmddValue <= to;
  return mmddValue >= from || mmddValue <= to;
}

export function nightlyRate(iso: string, config: BookingConfig): number {
  for (const season of config.seasons) {
    if (inSeason(mmdd(iso), season.from, season.to)) return season.nightly;
  }
  return config.defaultNightly;
}

export function minNightly(config: BookingConfig): number {
  const rates = [config.defaultNightly, ...config.seasons.map((s) => s.nightly)];
  return Math.min(...rates);
}

export function isNightBlocked(iso: string, blocked: readonly DateRange[]): boolean {
  return blocked.some((range) => iso >= range.from && iso < range.to);
}

function inClosedMmdd(mmddValue: string, from: string, to: string): boolean {
  if (from <= to) return mmddValue >= from && mmddValue < to;
  return mmddValue >= from || mmddValue < to;
}

export function isNightUnavailable(iso: string, config: BookingConfig): boolean {
  if (isNightBlocked(iso, config.blocked)) return true;
  if (!config.closedMmdd) return false;
  return inClosedMmdd(mmdd(iso), config.closedMmdd.from, config.closedMmdd.to);
}

export function nightsBetween(checkIn: string, checkOut: string): string[] {
  if (checkOut <= checkIn) return [];
  const nights: string[] = [];
  let cursor = checkIn;
  while (cursor < checkOut) {
    nights.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return nights;
}

/** Jours inclusifs (ex. 12 → 16 = 12, 13, 14, 15, 16). */
export function daysInclusive(from: string, to: string): string[] {
  const start = from <= to ? from : to;
  const end = from <= to ? to : from;
  return nightsBetween(start, addDays(end, 1));
}

export function minNightsForStay(checkIn: string, checkOut: string, config: BookingConfig): number {
  const nights = nightsBetween(checkIn, checkOut);
  let required = config.minNights;
  for (const night of nights) {
    const month = fromISODate(night).getMonth() + 1;
    const monthly = config.minNightsByMonth?.[month];
    if (monthly != null) required = Math.max(required, monthly);
  }
  return required;
}

export function rangeIsAvailable(checkIn: string, checkOut: string, config: BookingConfig): boolean {
  const nights = nightsBetween(checkIn, checkOut);
  if (nights.length < minNightsForStay(checkIn, checkOut, config)) return false;
  return nights.every((n) => !isNightUnavailable(n, config) && n >= todayISO());
}

export function quoteStay(checkIn: string, checkOut: string, config: BookingConfig) {
  const nights = nightsBetween(checkIn, checkOut);
  const lines = nights.map((n) => ({ date: n, amount: nightlyRate(n, config) }));
  const lodging = lines.reduce((sum, l) => sum + l.amount, 0);
  return {
    nights: nights.length,
    lines,
    lodging,
    cleaningFee: config.cleaningFee,
    total: lodging + config.cleaningFee,
  };
}
