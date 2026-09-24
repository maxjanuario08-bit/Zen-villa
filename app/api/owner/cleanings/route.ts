import { NextResponse } from "next/server";
import { getLogement } from "@/lib/logements";
import { canOperateStay, canViewStayBoard } from "@/lib/owner-ops-auth";
import { createCleaning, getCleaningsForSlug } from "@/lib/owner-data";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!slug || !getLogement(slug) || !(await canViewStayBoard(slug))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ cleanings: await getCleaningsForSlug(slug) });
}

export async function POST(req: Request) {
  let body: {
    slug?: string;
    stayId?: string;
    date?: string;
    time?: string;
    cleanerName?: string;
    notes?: string;
    photos?: string[];
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  if (!slug || !getLogement(slug) || !(await canOperateStay(slug))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const date = String(body.date ?? "");
  const cleanerName = String(body.cleanerName ?? "").trim();
  if (!ISO_DATE.test(date) || !cleanerName) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const created = await createCleaning({
    slug,
    stayId: String(body.stayId ?? ""),
    date,
    time: String(body.time ?? "10:00"),
    cleanerName,
    notes: String(body.notes ?? ""),
    photos: Array.isArray(body.photos) ? body.photos : [],
  });
  if ("error" in created) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, cleaning: created });
}
