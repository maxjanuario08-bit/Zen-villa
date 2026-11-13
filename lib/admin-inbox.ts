import { randomUUID } from "node:crypto";
import { pg } from "@/lib/owner-pg";

export type SiteInquiry = {
  nom: string;
  email: string;
  telephone: string;
  message: string;
  ville?: string;
  type?: string;
  prestation?: string;
  lieu?: string;
  dates?: string;
};

export type InboxStatus = "new" | "contacted" | "qualified" | "appointment" | "quote" | "signed" | "closed";
export const inboxStatuses: readonly InboxStatus[] = ["new", "contacted", "qualified", "appointment", "quote", "signed", "closed"];

export type InboxItem = {
  id: string;
  kind: "contact" | "service";
  data: SiteInquiry;
  source: string;
  status: InboxStatus;
  email_status: "pending" | "accepted" | "failed";
  created_at: string;
  next_action: string;
  due_date: string;
};

export async function receiveInquiry(
  kind: InboxItem["kind"],
  data: SiteInquiry,
  source: unknown,
  notify: (data: SiteInquiry) => Promise<boolean>,
) {
  const sql = await pg();
  const id = randomUUID();
  const channel = typeof source === "string" && ["instagram", "facebook", "flyer", "google"].includes(source)
    ? source : "";
  await sql`INSERT INTO site_inquiries (id, kind, data, source)
    VALUES (${id}, ${kind}, ${JSON.stringify(data)}::jsonb, ${channel})`;

  let accepted = false;
  try {
    accepted = await notify(data);
  } catch {
    console.error("site-inquiry: notification failed", id);
  }
  try {
    await sql`UPDATE site_inquiries SET email_status = ${accepted ? "accepted" : "failed"} WHERE id = ${id}`;
  } catch {
    console.error("site-inquiry: notification status unavailable", id);
  }
}

export async function listInquiries(offset = 0) {
  const sql = await pg();
  const [items, counts, ownerStages] = await Promise.all([
    sql`SELECT id, kind, data, source, status, email_status, created_at, next_action, due_date FROM site_inquiries ORDER BY created_at DESC, id DESC LIMIT 25 OFFSET ${offset}`,
    sql`SELECT status, count(*)::int AS count FROM site_inquiries GROUP BY status`,
    sql`SELECT source, status, count(*)::int AS count FROM site_inquiries WHERE kind = 'contact' GROUP BY source, status`,
  ]);
  return { ownerStages: ownerStages as { source: string; status: InboxStatus; count: number }[], items: items as InboxItem[], counts: Object.fromEntries(counts.map(row => [row.status, row.count])) as Partial<Record<InboxStatus, number>> };
}

export async function updateInquiryStatus(id: string, status: InboxStatus, action: string, due: string) {
  const sql = await pg();
  const rows = await sql`UPDATE site_inquiries SET status = ${status}, next_action = ${action}, due_date = ${due} WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
