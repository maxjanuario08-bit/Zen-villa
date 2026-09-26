import { NextResponse } from "next/server";
import { getLogement } from "@/lib/logements";
import { canOperateStay, isOpsSession } from "@/lib/owner-ops-auth";
import { clockStaffIn, clockStaffOut, getShiftsForSlug } from "@/lib/owner-data";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!slug || !getLogement(slug) || !(await isOpsSession())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ shifts: await getShiftsForSlug(slug) });
}

export async function POST(req: Request) {
  let body: { slug?: string; name?: string; action?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "");
  if (!slug || !getLogement(slug) || !(await canOperateStay(slug))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const action = String(body.action ?? "");
  const name = String(body.name ?? "");
  const result =
    action === "in" ? await clockStaffIn(slug, name) : action === "out" ? await clockStaffOut(slug, name) : { error: "invalid" as const };

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, shift: result });
}
