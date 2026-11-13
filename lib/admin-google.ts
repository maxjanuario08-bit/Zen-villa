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

export class GoogleAnalyticsError extends Error {
  constructor(public readonly stage: "identity" | "federation" | "service_account" | "report", public readonly status?: number) {
    super("Google Analytics request failed");
  }
}

async function federatedGoogleToken(audience: string, account: string, oidcToken: string | null, section: "analytics" | "seo") {
  if (!oidcToken) throw new GoogleAnalyticsError("identity");
  const exchange = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    body: new URLSearchParams({
      audience,
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      requested_token_type: "urn:ietf:params:oauth:token-type:access_token",
      scope: "https://www.googleapis.com/auth/cloud-platform",
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      subject_token: oidcToken,
    }),
    signal: AbortSignal.timeout(6500),
    cache: "no-store",
  });
  if (!exchange.ok) throw new GoogleAnalyticsError("federation", exchange.status);
  const { access_token } = await exchange.json();
  if (typeof access_token !== "string") throw new Error("Google identity token unavailable");

  const response = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(account)}:generateAccessToken`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ scope: [scopes[section]] }),
      signal: AbortSignal.timeout(6500),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new GoogleAnalyticsError("service_account", response.status);
  const { accessToken } = await response.json();
  if (typeof accessToken !== "string") throw new Error("Google Analytics access token unavailable");
  return accessToken;
}

export async function readGoogleSection(section: GoogleSection, oidcToken: string | null = null) {
  const config = process.env.ZENVILLA_GOOGLE_SERVICE_ACCOUNT_JSON;
  const audience = process.env.ZENVILLA_GOOGLE_WIF_AUDIENCE?.trim();
  const serviceAccount = process.env.ZENVILLA_GOOGLE_WIF_SERVICE_ACCOUNT?.trim();
  const calendar = process.env.ZENVILLA_GOOGLE_CALENDAR_ID;
  const appointmentTitle = process.env.ZENVILLA_GOOGLE_APPOINTMENT_TITLE?.trim();
  if (section === "calendar" && (!calendar || !appointmentTitle)) return null;

  let token: string;
  if (section !== "calendar" && audience && serviceAccount) {
    token = await federatedGoogleToken(audience, serviceAccount, oidcToken, section);
  } else if (config) {
    token = await accessToken(JSON.parse(config) as Account, section);
  } else {
    return null;
  }
  async function google(url: string, body?: object) {
    const response = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(6500),
      cache: "no-store",
    });
    if (!response.ok) {
      if (section === "analytics") throw new GoogleAnalyticsError("report", response.status);
      throw new Error("Google report unavailable");
    }
    return response.json();
  }

  if (section === "analytics") {
    const property = process.env.ZENVILLA_GA_PROPERTY_ID || "560697597";
    if (!/^\d+$/.test(property)) throw new Error("Invalid Analytics property");
    const dateRanges = [{ startDate: "28daysAgo", endDate: "yesterday" }];
    const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${property}:batchRunReports`;
    const events = ["generate_lead", "contact_whatsapp", "contact_phone", "contact_email", "appointment_click", "lead_form_start", "assistant_no_result"];
    const [{ reports }, attribution] = await Promise.all([google(endpoint, { requests: [
      { dateRanges, metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }] },
      { dateRanges, dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }],
        dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: events } } } },
      { dateRanges, dimensions: [{ name: "sessionSourceMedium" }], metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 8 },
      { dateRanges, dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 8 },
    ] }), google(endpoint, { requests: ["sessionSourceMedium", "landingPage"].flatMap(name => [
      { dateRanges, dimensions: [{ name }], metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 20 },
      { dateRanges, dimensions: [{ name }, { name: "eventName" }], metrics: [{ name: "eventCount" }],
        dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: ["generate_lead", "appointment_click"] } } },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 250 },
    ]) }).catch(() => null)]);

    const asRows = (rows: MetricRow[] = []) => rows.map(row => ({
      label: row.dimensionValues?.[0]?.value || "—", value: Number(row.metricValues?.[0]?.value || 0),
    }));
    function breakdown(index: number) {
      if (!attribution) return null;
      const sessions = asRows(attribution.reports[index].rows);
      const actions: MetricRow[] = attribution.reports[index + 1].rows ?? [];
      const counts = new Map<string, { leads?: number; appointments?: number }>();
      for (const row of actions) {
        const [label, event] = row.dimensionValues?.map(d => d.value) ?? [];
        if (!label) continue;
        const value = Number(row.metricValues?.[0]?.value ?? 0);
        const entry = counts.get(label) ?? {};
        if (event === "generate_lead") entry.leads = (entry.leads ?? 0) + value;
        if (event === "appointment_click") entry.appointments = (entry.appointments ?? 0) + value;
        counts.set(label, entry);
      }
      const byLabel = new Map(sessions.map(row => [row.label, row.value]));
      const partial = Number(attribution.reports[index + 1].rowCount ?? 0) > actions.length;
      return [...new Set([...counts.keys(), ...byLabel.keys()])].map(label => ({
        label, sessions: byLabel.get(label) ?? null,
        leads: counts.get(label)?.leads ?? (partial ? null : 0),
        appointments: counts.get(label)?.appointments ?? (partial ? null : 0),
      }));
    }
    return {
      totals: ((reports[0].rows?.[0]?.metricValues ?? []) as { value: string }[]).map(row => Number(row.value)),
      bySource: breakdown(0), byLanding: breakdown(2),
      events: asRows(reports[1].rows), sources: asRows(reports[2].rows), pages: asRows(reports[3].rows),
    };
  }

  if (section === "seo") {
    const property = encodeURIComponent(process.env.ZENVILLA_SEARCH_CONSOLE_SITE || "sc-domain:zen-villa.fr");
    const date = (days: number) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const period = { startDate: date(30), endDate: date(3), type: "web", dataState: "final" };
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${property}/searchAnalytics/query`;
    const previousPeriod = { ...period, startDate: date(58), endDate: date(31) };
    const [total, queries, pages, previous, pairs] = await Promise.all([
      google(endpoint, period),
      google(endpoint, { ...period, dimensions: ["query"], rowLimit: 10 }),
      google(endpoint, { ...period, dimensions: ["page"], rowLimit: 8 }),
      google(endpoint, previousPeriod),
      google(endpoint, { ...period, dimensions: ["query", "page"], rowLimit: 25 }),
    ]);
    return { period, previousPeriod, previous: previous.rows?.[0] ?? null, pairs: pairs.rows ?? [], total: total.rows?.[0] ?? null, queries: queries.rows ?? [], pages: pages.rows ?? [] };
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
