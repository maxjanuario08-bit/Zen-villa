import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { pg, usePostgres } from "@/lib/owner-pg";
import {
  CRM_ROLES,
  CRM_SOURCES,
  CRM_STATUSES,
  CRM_ZONES,
  type CrmClient,
  type CrmEmployee,
  type CrmProspect,
  type CrmProspectLog,
  type CrmRole,
  type CrmSource,
  type CrmStatus,
  type CrmZone,
} from "@/lib/admin-crm-types";

export type { CrmClient, CrmEmployee, CrmProspect, CrmProspectLog };
export { CRM_ROLES, CRM_SOURCES, CRM_STATUSES, CRM_ZONES };

const STORE_PATH = path.join(process.cwd(), "data", "admin-crm.json");

type StoreFile = {
  clients: CrmClient[];
  employees: CrmEmployee[];
  prospects: CrmProspect[];
};

function nowIso() {
  return new Date().toISOString();
}

function stamp(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

function asZone(value: string) {
  return CRM_ZONES.includes(value as CrmZone) ? value : "other";
}
function asSource(value: string) {
  return CRM_SOURCES.includes(value as CrmSource) ? value : "other";
}
function asStatus(value: string) {
  return CRM_STATUSES.includes(value as CrmStatus) ? value : "new";
}
function asRole(value: string) {
  return CRM_ROLES.includes(value as CrmRole) ? value : "other";
}

function trim(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

async function readFile(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreFile>;
    return {
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
      employees: Array.isArray(parsed.employees) ? parsed.employees : [],
      prospects: Array.isArray(parsed.prospects) ? parsed.prospects : [],
    };
  } catch {
    return { clients: [], employees: [], prospects: [] };
  }
}

async function writeFile(data: StoreFile) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function rowClient(row: Record<string, unknown>): CrmClient {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    zone: String(row.zone ?? ""),
    property: String(row.property ?? ""),
    address: String(row.address ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: stamp(row.created_at),
    updatedAt: stamp(row.updated_at),
  };
}

function rowEmployee(row: Record<string, unknown>): CrmEmployee {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    role: String(row.role ?? "other"),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    notes: String(row.notes ?? ""),
    active: Number(row.active ?? 1) === 1,
    createdAt: stamp(row.created_at),
    updatedAt: stamp(row.updated_at),
  };
}

function rowProspect(row: Record<string, unknown>, log: CrmProspectLog[] = []): CrmProspect {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    zone: String(row.zone ?? ""),
    property: String(row.property ?? ""),
    source: String(row.source ?? "other"),
    status: String(row.status ?? "new"),
    nextFollowUp: String(row.next_follow_up ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: stamp(row.created_at),
    updatedAt: stamp(row.updated_at),
    log,
  };
}

function rowLog(row: Record<string, unknown>): CrmProspectLog {
  return {
    id: String(row.id),
    prospectId: String(row.prospect_id),
    status: String(row.status ?? ""),
    message: String(row.message ?? ""),
    at: stamp(row.at),
  };
}

export async function listCrmClients(): Promise<CrmClient[]> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`SELECT * FROM crm_clients ORDER BY updated_at DESC`;
    return (rows as Record<string, unknown>[]).map(rowClient);
  }
  return (await readFile()).clients.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listCrmEmployees(): Promise<CrmEmployee[]> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`SELECT * FROM crm_employees ORDER BY name`;
    return (rows as Record<string, unknown>[]).map(rowEmployee);
  }
  return [...(await readFile()).employees].sort((a, b) => a.name.localeCompare(b.name));
}

export async function listCrmProspects(): Promise<CrmProspect[]> {
  if (usePostgres()) {
    const sql = await pg();
    const rows = await sql`SELECT * FROM crm_prospects ORDER BY updated_at DESC`;
    const logs = await sql`SELECT * FROM crm_prospect_log ORDER BY at DESC`;
    const byId = new Map<string, CrmProspectLog[]>();
    for (const log of logs as Record<string, unknown>[]) {
      const item = rowLog(log);
      const list = byId.get(item.prospectId) ?? [];
      list.push(item);
      byId.set(item.prospectId, list);
    }
    return (rows as Record<string, unknown>[]).map((row) => rowProspect(row, byId.get(String(row.id)) ?? []));
  }
  return (await readFile()).prospects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createCrmClient(input: Partial<CrmClient>): Promise<CrmClient | { error: "invalid" }> {
  const name = trim(input.name, 80);
  if (name.length < 2) return { error: "invalid" };
  const item: CrmClient = {
    id: randomBytes(8).toString("hex"),
    name,
    email: trim(input.email, 120),
    phone: trim(input.phone, 40),
    zone: asZone(trim(input.zone, 40)),
    property: trim(input.property, 120),
    address: trim(input.address, 200),
    notes: trim(input.notes, 1000),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO crm_clients (id, name, email, phone, zone, property, address, notes, created_at, updated_at)
      VALUES (${item.id}, ${item.name}, ${item.email}, ${item.phone}, ${item.zone}, ${item.property}, ${item.address}, ${item.notes}, ${item.createdAt}, ${item.updatedAt})
    `;
    return item;
  }
  const file = await readFile();
  file.clients.unshift(item);
  await writeFile(file);
  return item;
}

export async function updateCrmClient(id: string, input: Partial<CrmClient>): Promise<CrmClient | null> {
  const current = (await listCrmClients()).find((row) => row.id === id);
  if (!current) return null;
  const next: CrmClient = {
    ...current,
    name: trim(input.name ?? current.name, 80) || current.name,
    email: trim(input.email ?? current.email, 120),
    phone: trim(input.phone ?? current.phone, 40),
    zone: asZone(trim(input.zone ?? current.zone, 40)),
    property: trim(input.property ?? current.property, 120),
    address: trim(input.address ?? current.address, 200),
    notes: trim(input.notes ?? current.notes, 1000),
    updatedAt: nowIso(),
  };
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      UPDATE crm_clients SET name=${next.name}, email=${next.email}, phone=${next.phone}, zone=${next.zone},
        property=${next.property}, address=${next.address}, notes=${next.notes}, updated_at=${next.updatedAt}
      WHERE id=${id}
    `;
    return next;
  }
  const file = await readFile();
  file.clients = file.clients.map((row) => (row.id === id ? next : row));
  await writeFile(file);
  return next;
}

export async function deleteCrmClient(id: string): Promise<boolean> {
  if (usePostgres()) {
    const sql = await pg();
    await sql`DELETE FROM crm_clients WHERE id=${id}`;
    return true;
  }
  const file = await readFile();
  const before = file.clients.length;
  file.clients = file.clients.filter((row) => row.id !== id);
  await writeFile(file);
  return file.clients.length < before;
}

export async function createCrmEmployee(input: Partial<CrmEmployee>): Promise<CrmEmployee | { error: "invalid" }> {
  const name = trim(input.name, 80);
  if (name.length < 2) return { error: "invalid" };
  const item: CrmEmployee = {
    id: randomBytes(8).toString("hex"),
    name,
    role: asRole(trim(input.role, 40)),
    email: trim(input.email, 120),
    phone: trim(input.phone, 40),
    notes: trim(input.notes, 1000),
    active: input.active !== false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO crm_employees (id, name, role, email, phone, notes, active, created_at, updated_at)
      VALUES (${item.id}, ${item.name}, ${item.role}, ${item.email}, ${item.phone}, ${item.notes}, ${item.active ? 1 : 0}, ${item.createdAt}, ${item.updatedAt})
    `;
    return item;
  }
  const file = await readFile();
  file.employees.push(item);
  await writeFile(file);
  return item;
}

export async function updateCrmEmployee(id: string, input: Partial<CrmEmployee>): Promise<CrmEmployee | null> {
  const current = (await listCrmEmployees()).find((row) => row.id === id);
  if (!current) return null;
  const next: CrmEmployee = {
    ...current,
    name: trim(input.name ?? current.name, 80) || current.name,
    role: asRole(trim(input.role ?? current.role, 40)),
    email: trim(input.email ?? current.email, 120),
    phone: trim(input.phone ?? current.phone, 40),
    notes: trim(input.notes ?? current.notes, 1000),
    active: typeof input.active === "boolean" ? input.active : current.active,
    updatedAt: nowIso(),
  };
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      UPDATE crm_employees SET name=${next.name}, role=${next.role}, email=${next.email}, phone=${next.phone},
        notes=${next.notes}, active=${next.active ? 1 : 0}, updated_at=${next.updatedAt}
      WHERE id=${id}
    `;
    return next;
  }
  const file = await readFile();
  file.employees = file.employees.map((row) => (row.id === id ? next : row));
  await writeFile(file);
  return next;
}

export async function deleteCrmEmployee(id: string): Promise<boolean> {
  if (usePostgres()) {
    const sql = await pg();
    await sql`DELETE FROM crm_employees WHERE id=${id}`;
    return true;
  }
  const file = await readFile();
  file.employees = file.employees.filter((row) => row.id !== id);
  await writeFile(file);
  return true;
}

export async function createCrmProspect(input: Partial<CrmProspect>): Promise<CrmProspect | { error: "invalid" }> {
  const name = trim(input.name, 80);
  if (name.length < 2) return { error: "invalid" };
  const item: CrmProspect = {
    id: randomBytes(8).toString("hex"),
    name,
    email: trim(input.email, 120),
    phone: trim(input.phone, 40),
    zone: asZone(trim(input.zone, 40)),
    property: trim(input.property, 120),
    source: asSource(trim(input.source, 40)),
    status: asStatus(trim(input.status, 40)),
    nextFollowUp: trim(input.nextFollowUp, 10),
    notes: trim(input.notes, 1000),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    log: [],
  };
  const firstLog: CrmProspectLog = {
    id: randomBytes(8).toString("hex"),
    prospectId: item.id,
    status: item.status,
    message: "Création du prospect",
    at: nowIso(),
  };
  item.log = [firstLog];
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO crm_prospects (id, name, email, phone, zone, property, source, status, next_follow_up, notes, created_at, updated_at)
      VALUES (${item.id}, ${item.name}, ${item.email}, ${item.phone}, ${item.zone}, ${item.property}, ${item.source}, ${item.status}, ${item.nextFollowUp}, ${item.notes}, ${item.createdAt}, ${item.updatedAt})
    `;
    await sql`
      INSERT INTO crm_prospect_log (id, prospect_id, status, message, at)
      VALUES (${firstLog.id}, ${firstLog.prospectId}, ${firstLog.status}, ${firstLog.message}, ${firstLog.at})
    `;
    return item;
  }
  const file = await readFile();
  file.prospects.unshift(item);
  await writeFile(file);
  return item;
}

export async function updateCrmProspect(id: string, input: Partial<CrmProspect>): Promise<CrmProspect | null> {
  const current = (await listCrmProspects()).find((row) => row.id === id);
  if (!current) return null;
  const nextStatus = asStatus(trim(input.status ?? current.status, 40));
  const next: CrmProspect = {
    ...current,
    name: trim(input.name ?? current.name, 80) || current.name,
    email: trim(input.email ?? current.email, 120),
    phone: trim(input.phone ?? current.phone, 40),
    zone: asZone(trim(input.zone ?? current.zone, 40)),
    property: trim(input.property ?? current.property, 120),
    source: asSource(trim(input.source ?? current.source, 40)),
    status: nextStatus,
    nextFollowUp: trim(input.nextFollowUp ?? current.nextFollowUp, 10),
    notes: trim(input.notes ?? current.notes, 1000),
    updatedAt: nowIso(),
  };
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      UPDATE crm_prospects SET name=${next.name}, email=${next.email}, phone=${next.phone}, zone=${next.zone},
        property=${next.property}, source=${next.source}, status=${next.status}, next_follow_up=${next.nextFollowUp},
        notes=${next.notes}, updated_at=${next.updatedAt}
      WHERE id=${id}
    `;
  } else {
    const file = await readFile();
    file.prospects = file.prospects.map((row) => (row.id === id ? { ...next, log: row.log } : row));
    await writeFile(file);
  }
  if (nextStatus !== current.status) {
    await addCrmProspectLog(id, nextStatus, `Statut : ${nextStatus}`);
  }
  return (await listCrmProspects()).find((row) => row.id === id) ?? next;
}

export async function addCrmProspectLog(
  prospectId: string,
  status: string,
  message: string,
): Promise<CrmProspectLog | null> {
  const current = (await listCrmProspects()).find((row) => row.id === prospectId);
  if (!current) return null;
  const item: CrmProspectLog = {
    id: randomBytes(8).toString("hex"),
    prospectId,
    status: asStatus(status || current.status),
    message: trim(message, 500) || "Note",
    at: nowIso(),
  };
  if (usePostgres()) {
    const sql = await pg();
    await sql`
      INSERT INTO crm_prospect_log (id, prospect_id, status, message, at)
      VALUES (${item.id}, ${item.prospectId}, ${item.status}, ${item.message}, ${item.at})
    `;
    await sql`UPDATE crm_prospects SET updated_at=${item.at} WHERE id=${prospectId}`;
    return item;
  }
  const file = await readFile();
  file.prospects = file.prospects.map((row) =>
    row.id === prospectId ? { ...row, log: [item, ...row.log], updatedAt: item.at } : row,
  );
  await writeFile(file);
  return item;
}

export async function deleteCrmProspect(id: string): Promise<boolean> {
  if (usePostgres()) {
    const sql = await pg();
    await sql`DELETE FROM crm_prospect_log WHERE prospect_id=${id}`;
    await sql`DELETE FROM crm_prospects WHERE id=${id}`;
    return true;
  }
  const file = await readFile();
  file.prospects = file.prospects.filter((row) => row.id !== id);
  await writeFile(file);
  return true;
}

export async function convertProspectToClient(id: string): Promise<CrmClient | null> {
  const prospect = (await listCrmProspects()).find((row) => row.id === id);
  if (!prospect) return null;
  const created = await createCrmClient({
    name: prospect.name,
    email: prospect.email,
    phone: prospect.phone,
    zone: prospect.zone,
    property: prospect.property,
    notes: prospect.notes,
  });
  if ("error" in created) return null;
  await updateCrmProspect(id, { status: "won" });
  await addCrmProspectLog(id, "won", "Converti en client");
  return created;
}
