import { NextResponse } from "next/server";
import { adminRequestOk } from "@/lib/owner-admin";
import {
  addCrmProspectLog,
  convertProspectToClient,
  createCrmClient,
  createCrmEmployee,
  createCrmProspect,
  listCrmClients,
  listCrmEmployees,
  listCrmProspects,
} from "@/lib/admin-crm";

export async function GET(req: Request) {
  if (!(await adminRequestOk(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [clients, employees, prospects] = await Promise.all([
    listCrmClients(),
    listCrmEmployees(),
    listCrmProspects(),
  ]);
  return NextResponse.json({ clients, employees, prospects });
}

export async function POST(req: Request) {
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
  if (kind === "client") {
    const created = await createCrmClient(body);
    if ("error" in created) return NextResponse.json(created, { status: 400 });
    return NextResponse.json({ ok: true, client: created });
  }
  if (kind === "employee") {
    const created = await createCrmEmployee(body);
    if ("error" in created) return NextResponse.json(created, { status: 400 });
    return NextResponse.json({ ok: true, employee: created });
  }
  if (kind === "prospect") {
    const created = await createCrmProspect(body);
    if ("error" in created) return NextResponse.json(created, { status: 400 });
    return NextResponse.json({ ok: true, prospect: created });
  }
  if (kind === "log") {
    const log = await addCrmProspectLog(String(body.id ?? ""), String(body.status ?? ""), String(body.message ?? ""));
    if (!log) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, log });
  }
  if (kind === "convert") {
    const client = await convertProspectToClient(String(body.id ?? ""));
    if (!client) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, client });
  }
  return NextResponse.json({ error: "invalid" }, { status: 400 });
}
