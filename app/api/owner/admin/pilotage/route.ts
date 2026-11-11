import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/owner-admin";
import { inboxStatuses, listInquiries, updateInquiryStatus, type InboxStatus } from "@/lib/admin-inbox";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  try {
    const offset = new URL(req.url).searchParams.get("offset") ?? "0";
    if (!/^\d{1,7}$/.test(offset)) return NextResponse.json({ error: "invalid" }, { status: 400, headers });
    return NextResponse.json(await listInquiries(Number(offset)), { headers });
  } catch {
    return NextResponse.json({ error: "inbox_unavailable" }, { status: 503, headers });
  }
}

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  if (req.headers.get("origin") !== new URL(req.url).origin)
    return NextResponse.json({ error: "origin" }, { status: 403, headers });
  const body = await req.json().catch(() => null);
  if (typeof body?.id !== "string" || !inboxStatuses.includes(body.status as InboxStatus))
    return NextResponse.json({ error: "invalid" }, { status: 400, headers });
  try {
    const action = typeof body.action === "string" ? body.action.trim().slice(0, 250) : "";
    const due = typeof body.due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.due) ? body.due : "";
    const ok = await updateInquiryStatus(body.id, body.status, action, due);
    return NextResponse.json({ ok }, { status: ok ? 200 : 404, headers });
  } catch {
    return NextResponse.json({ error: "inbox_unavailable" }, { status: 503, headers });
  }
}
