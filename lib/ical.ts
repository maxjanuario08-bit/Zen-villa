import type { DateRange } from "@/lib/booking";
import { mergeDateRanges } from "@/lib/booking";

export function icalEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildBusyIcs(slug: string, ranges: readonly DateRange[], calName: string) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zenvilla//Calendar//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icalEscape(calName)}`,
  ];
  for (const range of ranges) {
    const uid = `zenvilla-${slug}-${range.from}-${range.to}@zen-villa.fr`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${range.from.replace(/-/g, "")}T080000Z`,
      `DTSTART;VALUE=DATE:${range.from.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${range.to.replace(/-/g, "")}`,
      "SUMMARY:Reserved",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

function icalDate(raw: string) {
  const compact = raw.replace(/[^\d]/g, "").slice(0, 8);
  if (compact.length !== 8) return null;
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

export function parseIcalBusyRanges(ics: string): DateRange[] {
  const events = ics.split(/BEGIN:VEVENT/i).slice(1);
  const ranges: DateRange[] = [];
  for (const chunk of events) {
    const startMatch = chunk.match(/DTSTART(?:;VALUE=DATE)?:([^\r\n]+)/i);
    const endMatch = chunk.match(/DTEND(?:;VALUE=DATE)?:([^\r\n]+)/i);
    const from = startMatch ? icalDate(startMatch[1]) : null;
    const to = endMatch ? icalDate(endMatch[1]) : from;
    if (from && to && to > from) ranges.push({ from, to });
    else if (from) ranges.push({ from, to: from });
  }
  return mergeDateRanges(ranges);
}
