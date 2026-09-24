import { NextResponse } from "next/server";
import { getLogement } from "@/lib/logements";
import { getOwnerSession, ownerOwnsSlug } from "@/lib/owner-auth";
import { createCleaning } from "@/lib/owner-data";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: Request) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: {
    slug?: string;
    stayId?: string;
    date?: string;
    time?: string;
    cleanerName?: string;
    notes?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  if (!slug || !getLogement(slug) || !ownerOwnsSlug(session, slug)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const date = String(body.date ?? "");
  if (!ISO_DATE.test(date)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const created = await createCleaning({
    slug,
    stayId: String(body.stayId ?? ""),
    date,
    time: String(body.time ?? "10:00"),
    cleanerName: String(body.cleanerName ?? ""),
    notes: String(body.notes ?? ""),
  });
  if ("error" in created) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, cleaning: created });
}
