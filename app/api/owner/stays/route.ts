import { NextResponse } from "next/server";
import { getLogement } from "@/lib/logements";
import { canBookOrBlock, canOperateStay, isOpsSession } from "@/lib/owner-ops-auth";
import { addStayPhotos, createManualStay, deleteStay, getStayById, getStaysForSlug, markStayCheck } from "@/lib/owner-data";
import { getOwnerSession, ownerOwnsSlug } from "@/lib/owner-auth";
import { ownerMayDeleteStay } from "@/lib/owner-types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!slug || !getLogement(slug) || !(await canBookOrBlock(slug))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ stays: await getStaysForSlug(slug) });
}

export async function POST(req: Request) {
  let body: {
    slug?: string;
    guestLabel?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  if (!slug || !getLogement(slug) || !(await canBookOrBlock(slug))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const checkIn = String(body.checkIn ?? "");
  const checkOut = String(body.checkOut ?? "");
  if (!ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const created = await createManualStay({
    slug,
    guestLabel: String(body.guestLabel ?? ""),
    checkIn,
    checkOut,
    guests: Number(body.guests) || 1,
    bookedBy: (await isOpsSession()) ? "ops" : "owner",
  });
  if ("error" in created) {
    const status = created.error === "overlap" ? 409 : 400;
    return NextResponse.json({ error: created.error }, { status });
  }
  return NextResponse.json({ ok: true, stay: created });
}

export async function PATCH(req: Request) {
  let body: {
    slug?: string;
    stayId?: string;
    action?: string;
    photos?: string[];
    by?: string;
    time?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  const stayId = String(body.stayId ?? "");
  if (!slug || !stayId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (body.action === "delete") {
    const stay = await getStayById(stayId);
    if (!stay || stay.slug !== slug) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const ops = await isOpsSession();
    const owner = await getOwnerSession();
    const ownerOk = Boolean(owner && ownerOwnsSlug(owner, slug) && ownerMayDeleteStay(stay));
    if (!ops && !ownerOk) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const ok = await deleteStay(stayId, slug);
    if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (!(await canOperateStay(slug))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (body.action === "photos-in" || body.action === "photos-out") {
    const stay = await addStayPhotos(
      stayId,
      slug,
      body.action === "photos-in" ? "in" : "out",
      Array.isArray(body.photos) ? body.photos : [],
    );
    if (!stay) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, stay });
  }

  if (body.action !== "checkin" && body.action !== "checkout") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const by = String(body.by ?? "").trim();
  if (!by) return NextResponse.json({ error: "need_by" }, { status: 400 });
  const stay = await markStayCheck(stayId, slug, body.action === "checkin" ? "in" : "out", {
    by,
    time: String(body.time ?? ""),
  });
  if (!stay) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, stay });
}
