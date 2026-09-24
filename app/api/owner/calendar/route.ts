import { NextResponse } from "next/server";
import { isNightBlocked, nightsBetween } from "@/lib/booking";
import { getOwnerSession, ownerOwnsSlug } from "@/lib/owner-auth";
import { getOwnerCalendarPayload } from "@/lib/owner-calendar";
import { addOwnerNight, addOwnerRange, removeOwnerNight } from "@/lib/owner-store";
import { getStaysForSlug } from "@/lib/owner-data";
import { getLogement } from "@/lib/logements";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function rentedRanges(slug: string) {
  return (await getStaysForSlug(slug)).map((stay) => ({ from: stay.checkIn, to: stay.checkOut }));
}

export async function GET(req: Request) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!slug || !ownerOwnsSlug(session, slug)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const payload = await getOwnerCalendarPayload(slug);
  return NextResponse.json(payload);
}

export async function POST(req: Request) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { slug?: string; night?: string; from?: string; to?: string; action?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  if (!slug || !getLogement(slug) || !ownerOwnsSlug(session, slug)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const action = body.action === "unblock" ? "unblock" : "block";
  const rented = await rentedRanges(slug);

  if (body.night && ISO_DATE.test(body.night)) {
    const night = body.night;
    if (isNightBlocked(night, rented)) {
      return NextResponse.json({ error: "rented" }, { status: 409 });
    }
    const blocks =
      action === "unblock" ? await removeOwnerNight(slug, night) : await addOwnerNight(slug, night);
    return NextResponse.json({ ok: true, blocks });
  }

  const from = String(body.from ?? "");
  const to = String(body.to ?? "");
  if (!ISO_DATE.test(from) || !ISO_DATE.test(to) || to <= from) {
    return NextResponse.json({ error: "invalid_dates" }, { status: 400 });
  }

  if (action === "unblock") {
    let blocks = (await getOwnerCalendarPayload(slug)).ownerBlocks;
    for (const night of nightsBetween(from, to)) {
      if (!isNightBlocked(night, rented)) {
        blocks = await removeOwnerNight(slug, night);
      }
    }
    return NextResponse.json({ ok: true, blocks });
  }

  const nights = nightsBetween(from, to);
  if (nights.some((night) => isNightBlocked(night, rented))) {
    return NextResponse.json({ error: "rented" }, { status: 409 });
  }
  const blocks = await addOwnerRange(slug, from, to);
  return NextResponse.json({ ok: true, blocks });
}

export async function DELETE(req: Request) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const night = url.searchParams.get("night") ?? "";
  if (!slug || !ownerOwnsSlug(session, slug) || !ISO_DATE.test(night)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const blocks = await removeOwnerNight(slug, night);
  return NextResponse.json({ ok: true, blocks });
}
