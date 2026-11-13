import sitemap from "@/app/sitemap";
import { buildAssistantKnowledge } from "@/lib/assistant-knowledge";
import { GoogleAnalyticsError, readGoogleSection } from "@/lib/admin-google";
import { pg } from "@/lib/owner-pg";
import publicCopy from "@/messages/locales/fr";

type SeoRow = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

function safeLabel(value: string) {
  return value.split(/[?#]/, 1)[0]
    .replace(/[^\s/]+@[^\s/]+/g, "[masqué]")
    .replace(/\+?\d[\d ().-]{7,}\d/g, "[masqué]")
    .slice(0, 180);
}

function seoRows(rows: SeoRow[]) {
  return rows.map(({ keys, clicks, impressions, ctr, position }) => ({
    dimensions: keys?.map(safeLabel), clicks, impressions, ctr, position,
  }));
}

async function readOperations() {
  const sql = await pg();
  const [row] = await sql`
    SELECT
      (SELECT count(*)::int FROM owner_stays WHERE check_in >= CURRENT_DATE AND check_in < CURRENT_DATE + 30) AS upcoming_arrivals,
      (SELECT count(*)::int FROM owner_stays WHERE check_out >= CURRENT_DATE AND check_out < CURRENT_DATE + 30) AS upcoming_departures,
      (SELECT count(*)::int FROM owner_cleanings WHERE date >= CURRENT_DATE AND date < CURRENT_DATE + 30) AS cleaning_records,
      (SELECT count(*)::int FROM pending_bookings WHERE paid_at >= NOW() - INTERVAL '28 days') AS paid_web_bookings,
      (SELECT COALESCE(sum(amount), 0)::text FROM pending_bookings WHERE paid_at >= NOW() - INTERVAL '28 days') AS paid_web_amount_eur
  `;
  return { nextDays: 30, paymentLookbackDays: 28, ...row };
}

async function readSource<T>(name: string, task: Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      task.then(data => data == null ? { status: "not_configured" } : { status: "available", data }),
      new Promise<{ status: "unavailable" }>(resolve => {
        timer = setTimeout(() => resolve({ status: "unavailable" }), 9000);
      }),
    ]);
  } catch (error) {
    console.warn("Assistant context unavailable", {
      source: name, stage: error instanceof GoogleAnalyticsError ? error.stage : undefined,
    });
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

export async function readAssistantSiteContext(oidcToken: string | null) {
  const [analytics, searchConsole, calendar, operations] = await Promise.all([
    readSource("analytics", readGoogleSection("analytics", oidcToken).then(report => {
      if (!report || !("totals" in report) || !report.totals) return null;
      const sanitize = <T extends { label: string }>(rows: T[]) =>
        rows.slice(0, 20).map(row => ({ ...row, label: safeLabel(row.label) }));
      const [activeUsers, sessions, pageViews] = report.totals;
      return {
        completeDays: 28, activeUsers, sessions, pageViews,
        eventCounts: report.events,
        sessionsBySource: sanitize(report.sources),
        viewsByPage: sanitize(report.pages),
        actionsBySource: report.bySource ? sanitize(report.bySource) : null,
        actionsByLandingPage: report.byLanding ? sanitize(report.byLanding) : null,
      };
    })),
    readSource("search_console", readGoogleSection("seo", oidcToken).then(report => {
      if (!report || !("period" in report) || !report.period) return null;
      return {
        period: report.period, previousPeriod: report.previousPeriod,
        totals: report.total ? seoRows([report.total])[0] : null,
        previousTotals: report.previous ? seoRows([report.previous])[0] : null,
        queries: seoRows(report.queries), pages: seoRows(report.pages), queryPages: seoRows(report.pairs),
      };
    })),
    readSource("calendar", readGoogleSection("calendar", oidcToken).then(report => {
      if (!report || !("appointments" in report) || !report.appointments) return null;
      return { nextDays: 90, confirmedAppointments: report.appointments.length, truncated: report.truncated };
    })),
    readSource("operations", readOperations()),
  ]);
  return {
    analytics, searchConsole, calendar, operations,
    publicWebsite: {
      pages: sitemap().map(page => page.url),
      knowledge: buildAssistantKnowledge("fr", publicCopy).map(({ question, answer, href }) => ({
        topic: question, text: answer, path: href,
      })),
    },
  };
}
