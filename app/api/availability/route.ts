import { NextResponse } from "next/server";
import { getEffectiveBlockedRanges } from "@/lib/owner-calendar";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!slug) return NextResponse.json({ blocked: [] });
  try {
    const blocked = await getEffectiveBlockedRanges(slug);
    return NextResponse.json({ blocked });
  } catch (err) {
    console.error("availability", err);
    return NextResponse.json({ blocked: [] });
  }
}
