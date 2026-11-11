import { createSign } from "node:crypto";

type Account = { client_email: string; private_key: string };
type GoogleSection = "analytics" | "seo" | "calendar";

const scopes: Record<GoogleSection, string> = {
  analytics: "https://www.googleapis.com/auth/analytics.readonly",
  seo: "https://www.googleapis.com/auth/webmasters.readonly",
  calendar: "https://www.googleapis.com/auth/calendar.events.readonly",
};

async function accessToken(account: Account, section: GoogleSection) {
  const endpoint = "https://oauth2.googleapis.com/token";
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const iat = Math.floor(Date.now() / 1000);
  const unsigned = [encode({ alg: "RS256", typ: "JWT" }), encode({
    iss: account.client_email, scope: scopes[section], aud: endpoint, iat, exp: iat + 3600,
  })].join(".");
  const signature = createSign("RSA-SHA256").update(unsigned).sign(account.private_key, "base64url");
  const response = await fetch(endpoint, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: unsigned + "." + signature,
    }),
    signal: AbortSignal.timeout(6500),
  });
  if (!response.ok) throw new Error("Google authorization");
  const { access_token } = await response.json();
  if (typeof access_token !== "string") throw new Error("Google authorization");
  return access_token;
}

type MetricRow = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };

export async function readGoogleSection(section: GoogleSection) {
  const config = process.env.ZENVILLA_GOOGLE_SERVICE_ACCOUNT_JSON;
  const calendar = process.env.ZENVILLA_GOOGLE_CALENDAR_ID;
  const appointmentTitle = process.env.ZENVILLA_GOOGLE_APPOINTMENT_TITLE?.trim();
  if (!config || (section === "calendar" && (!calendar || !appointmentTitle))) return null;

  const account = JSON.parse(config) as Account;
  const token = await accessToken(account, section);
  async function google(url: string, body?: object) {
    const response = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(6500),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Google report unavailable");
    return response.json();
  }

  if (section === "analytics") {
    const property = process.env.ZENVILLA_GA_PROPERTY_ID || "560697597";
    if (!/^\d+$/.test(property)) throw new Error("Invalid Analytics property");
    const dateRanges = [{ startDate: "28daysAgo", endDate: "yesterday" }];
    const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${property}:batchRunReports`;
    const events = ["generate_lead", "contact_whatsapp", "contact_phone", "contact_email", "appointment_click", "lead_form_start", "assistant_no_result"];
    const { reports } = await google(endpoint, { requests: [
      { dateRanges, metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }] },
      { dateRanges, dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }],
        dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: events } } } },
      { dateRanges, dimensions: [{ name: "sessionSourceMedium" }], metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 8 },
      { dateRanges, dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 8 },
    ] });
    const asRows = (rows: MetricRow[] = []) => rows.map(row => ({
      label: row.dimensionValues?.[0]?.value || "—", value: Number(row.metricValues?.[0]?.value || 0),
    }));
    return {
      totals: ((reports[0].rows?.[0]?.metricValues ?? []) as { value: string }[]).map(row => Number(row.value)),
      events: asRows(reports[1].rows), sources: asRows(reports[2].rows), pages: asRows(reports[3].rows),
    };
  }

  if (section === "seo") {
    const property = encodeURIComponent(process.env.ZENVILLA_SEARCH_CONSOLE_SITE || "sc-domain:zen-villa.fr");
    const date = (days: number) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const period = { startDate: date(30), endDate: date(3), type: "web", dataState: "final" };
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${property}/searchAnalytics/query`;
    const [total, queries, pages] = await Promise.all([
      google(endpoint, period),
      google(endpoint, { ...period, dimensions: ["query"], rowLimit: 10 }),
      google(endpoint, { ...period, dimensions: ["page"], rowLimit: 8 }),
    ]);
    return { period, total: total.rows?.[0] ?? null, queries: queries.rows ?? [], pages: pages.rows ?? [] };
  }

  const now = new Date();
  const params = new URLSearchParams({
    timeMin: now.toISOString(), timeMax: new Date(now.getTime() + 90 * 86400000).toISOString(),
    singleEvents: "true", orderBy: "startTime", maxResults: "250", q: appointmentTitle!,
    fields: "items(id,summary,start,status,htmlLink),nextPageToken",
  });
  const { items, nextPageToken } = await google(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar!)}/events?${params}`,
  );
  return {
    appointments: (items ?? []).filter((event: { summary?: string; status: string }) =>
      event.status === "confirmed" && (event.summary === appointmentTitle || event.summary?.startsWith(appointmentTitle + " ("))),
    truncated: Boolean(nextPageToken),
  };
}
