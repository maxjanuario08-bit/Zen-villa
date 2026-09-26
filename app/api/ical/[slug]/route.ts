import { NextResponse } from "next/server";
import { buildBusyIcs } from "@/lib/ical";
import { getLogement } from "@/lib/logements";
import { getEffectiveBlockedRanges } from "@/lib/owner-calendar";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const logement = getLogement(slug.replace(/\.ics$/i, ""));
  const cleanSlug = logement?.slug ?? slug.replace(/\.ics$/i, "");
  if (!getLogement(cleanSlug)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const ranges = await getEffectiveBlockedRanges(cleanSlug);
  const name = logement?.copyKey ? `Zenvilla ${cleanSlug}` : cleanSlug;
  const ics = buildBusyIcs(cleanSlug, ranges, name);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${cleanSlug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
