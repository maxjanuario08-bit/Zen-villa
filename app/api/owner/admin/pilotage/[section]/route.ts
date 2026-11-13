import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/owner-admin";
import { readGoogleSection } from "@/lib/admin-google";
import { pg } from "@/lib/owner-pg";
import { readMailbox } from "@/lib/admin-mailbox";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request, context: { params: Promise<{ section: string }> }) {
  const headers = { "Cache-Control": "private, no-store" };
  if (!(await getAdminSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  const { section } = await context.params;
  try {
    if (section === "analytics" || section === "seo" || section === "calendar") {
      return NextResponse.json({
        data: await readGoogleSection(section, req.headers.get("x-vercel-oidc-token")),
      }, { headers });
    }
    if (section === "payments") {
      const sql = await pg();
      const data = await sql`SELECT slug, guest_label, check_in::text, check_out::text, amount::text, status, paid_at, created_at FROM pending_bookings ORDER BY created_at DESC LIMIT 25`;
      return NextResponse.json({ data }, { headers });
    }
    if (section === "mail") {
      const search = new URL(req.url).searchParams;
      const uid = search.get("uid");
      const offset = search.get("offset") ?? "0";
      if ((uid !== null && !/^\d{1,10}$/.test(uid)) || !/^\d{1,7}$/.test(offset))
        return NextResponse.json({ error: "invalid" }, { status: 400, headers });
      return NextResponse.json({ data: await readMailbox(uid === null ? null : Number(uid), Number(offset)) }, { headers });
    }
    return NextResponse.json({ error: "not_found" }, { status: 404, headers });
  } catch {
    return NextResponse.json({ error: "provider_unavailable" }, { status: 502, headers });
  }
}
