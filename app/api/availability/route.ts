import { NextResponse } from "next/server";
import { paidRangesForSlug } from "@/lib/paid-stays";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!slug) return NextResponse.json({ blocked: [] });
  try {
    const blocked = await paidRangesForSlug(slug);
    return NextResponse.json({ blocked });
  } catch (err) {
    console.error("availability", err);
    return NextResponse.json({ blocked: [] });
  }
}
