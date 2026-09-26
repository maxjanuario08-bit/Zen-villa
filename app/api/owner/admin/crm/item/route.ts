import { NextResponse } from "next/server";
import { adminRequestOk } from "@/lib/owner-admin";
import {
  deleteCrmClient,
  deleteCrmEmployee,
  deleteCrmProspect,
  updateCrmClient,
  updateCrmEmployee,
  updateCrmProspect,
} from "@/lib/admin-crm";
import type { CrmEmployee } from "@/lib/admin-crm-types";

export async function PATCH(req: Request) {
  if (!(await adminRequestOk(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const kind = String(body.kind ?? "");
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (kind === "client") {
    const item = await updateCrmClient(id, body);
    if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, client: item });
  }
  if (kind === "employee") {
    const patch: Partial<CrmEmployee> = { ...body };
    if (body.active !== undefined) {
      patch.active = body.active === true || body.active === "true" || body.active === 1;
    }
    const item = await updateCrmEmployee(id, patch);
    if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, employee: item });
  }
  if (kind === "prospect") {
    const nextFollowUp =
      body.nextFollowUp === undefined ? undefined : String(body.nextFollowUp);
    const item = await updateCrmProspect(id, { ...body, nextFollowUp });
    if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, prospect: item });
  }
  return NextResponse.json({ error: "invalid" }, { status: 400 });
}

export async function DELETE(req: Request) {
  if (!(await adminRequestOk(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? "";
  const id = url.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (kind === "client") await deleteCrmClient(id);
  else if (kind === "employee") await deleteCrmEmployee(id);
  else if (kind === "prospect") await deleteCrmProspect(id);
  else return NextResponse.json({ error: "invalid" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
