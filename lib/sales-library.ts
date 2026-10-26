import { localCrmPath } from "@/lib/local-crm-path";
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pg, usePostgres as hasSalesDatabase } from '@/lib/owner-pg';
import { initialSalesLibrary, SALES_SEED_PROVENANCE } from './sales-library-seed';
import type { SalesLibraryState, SalesSettings, SalesTemplate } from './sales-library-types';
export type * from './sales-library-types';

export class SalesLibraryError extends Error {
  constructor(message: string, public status: 400 | 409 = 400) { super(message); }
}
type Stored = { revision: number; seedVersion: string; state: SalesLibraryState };
const storePath = localCrmPath('sales-library.json', '.data');
let schema: Promise<void> | undefined;
/** One durable row holds the library and seed marker. CAS commits history and edits atomically. */
export async function ensureSalesSchema() {
  if (!hasSalesDatabase()) return;
  if (!schema) schema = (async () => {
    const sql = await pg();
    await sql`CREATE TABLE IF NOT EXISTS sales_library_state (
      id TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 0,
      seed_version TEXT NOT NULL, state_json JSONB NOT NULL
    )`;
    await sql`INSERT INTO sales_library_state (id, revision, seed_version, state_json)
      VALUES ('main', 0, ${SALES_SEED_PROVENANCE}, ${JSON.stringify(initialSalesLibrary())}::jsonb)
      ON CONFLICT (id) DO NOTHING`;
  })().catch(error => { schema = undefined; throw error; });
  await schema;
}
function initial(): Stored { return { revision: 0, seedVersion: SALES_SEED_PROVENANCE, state: initialSalesLibrary() }; }
async function readStored(): Promise<Stored> {
  if (hasSalesDatabase()) {
    await ensureSalesSchema();
    const sql = await pg();
    const rows = await sql`SELECT revision, seed_version, state_json FROM sales_library_state WHERE id = 'main'`;
    if (!rows[0]) throw new Error('sales_library_missing');
    return { revision: Number(rows[0].revision), seedVersion: String(rows[0].seed_version), state: rows[0].state_json as SalesLibraryState };
  }
  if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL required for sales library');
  try { return JSON.parse(await fs.readFile(storePath, 'utf8')) as Stored; }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  return initial();
}
// Local dev writes are serialized and protected by an exclusive lock across Node processes.
async function localLock<T>(work: () => Promise<T>): Promise<T> {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  let handle;
  for (let attempt=0;attempt<25;attempt++) {
    try { handle = await fs.open(`${storePath}.lock`, 'wx', 0o600); break; }
    catch(error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      if(attempt===24)throw new SalesLibraryError('library_busy_retry',409);
      await new Promise(resolve=>setTimeout(resolve,20));
    }
  }
  if(!handle)throw new SalesLibraryError('library_busy_retry',409);
  try { return await work(); }
  finally { await handle.close(); await fs.unlink(`${storePath}.lock`); }
}
async function writeLocal(value: Stored) {
  const tmp = `${storePath}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(tmp, JSON.stringify(value), { mode: 0o600 });
    await fs.rename(tmp, storePath);
  } finally { await fs.unlink(tmp).catch(() => undefined); }
}
export async function getSalesLibrary(): Promise<SalesLibraryState> {
  if (!hasSalesDatabase()) return localLock(async () => {
    const stored = await readStored();
    await writeLocal(stored); // Persist the seed marker even on the first read.
    return ordered(stored.state);
  });
  return ordered((await readStored()).state);
}
function ordered(state: SalesLibraryState): SalesLibraryState {
  return { ...state, templates: [...state.templates].sort((a,b) => a.position-b.position || a.id.localeCompare(b.id)), categories: [...state.categories].sort((a,b) => a.position-b.position || a.id.localeCompare(b.id)) };
}
const own = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SalesLibraryError('invalid_object');
  return value as Record<string, unknown>;
}
function str(value: unknown, max = 10000, required = false): string {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new SalesLibraryError('invalid_text');
  return value;
}
function identifier(value: unknown): string {
  const id = str(value, 100, true);
  if (!/^[a-zA-Z0-9_-]+$/.test(id) || forbidden.has(id)) throw new SalesLibraryError('invalid_id');
  return id;
}
function position(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 1e9) throw new SalesLibraryError('invalid_position');
  return value;
}
function stamp(previous?: string) {
  return new Date(Math.max(Date.now(), previous ? Date.parse(previous) + 1 : 0)).toISOString();
}
function saveVersion(state: SalesLibraryState, template: SalesTemplate) {
  state.versions.unshift({ id: randomUUID(), templateId: template.id, snapshot: structuredClone(template), createdAt: new Date().toISOString() });
}
function validTemplate(value: unknown, state: SalesLibraryState): SalesTemplate {
  const t = record(value);
  if (!Array.isArray(t.sections) || t.sections.length > 50) throw new SalesLibraryError('invalid_sections');
  const sections = t.sections.map(value => {
    const s = record(value);
    return { id: identifier(s.id), title: str(s.title, 200), content: str(s.content, 30000) };
  });
  if (new Set(sections.map(s => s.id)).size !== sections.length) throw new SalesLibraryError('duplicate_section');
  const categoryId = identifier(t.categoryId);
  if (!state.categories.some(c => c.id === categoryId)) throw new SalesLibraryError('category_not_found');
  if (t.status !== 'active' && t.status !== 'archived') throw new SalesLibraryError('invalid_status');
  return { id: identifier(t.id), title: str(t.title, 300, true), description: str(t.description, 2000), categoryId, subject: str(t.subject, 1000), content: str(t.content, 100000), sections, status: t.status, position: position(t.position), updatedAt: '' };
}
const settingsKeys = ['brand','website','email','phone','zone','objective','pricing'] as const;
const centralKeys: Record<string, keyof SalesSettings> = {
  entreprise: 'brand', telephone_zenvilla: 'phone', email_zenvilla: 'email', site_zenvilla: 'website',
  zone_zenvilla: 'zone', objectif_zenvilla: 'objective', tarification_zenvilla: 'pricing',
};
export { renderSalesTemplate } from "./sales-library-render";
/** Apply a validated action to an isolated state. Exported for deterministic unit tests. */
export function applySalesLibraryAction(state: SalesLibraryState, input: unknown): SalesLibraryState {
  const body = record(input);
  const action = str(body.action, 40, true);
  const next = structuredClone(state);
  const find = (id: unknown) => {
    const t = next.templates.find(t => t.id === identifier(id));
    if (!t) throw new SalesLibraryError('template_not_found');
    return t;
  };
  if (action === 'saveTemplate') {
    const template = validTemplate(body.template, next);
    const existing = next.templates.find(t => t.id === template.id);
    if (existing) {
      if (body.expectedUpdatedAt !== existing.updatedAt) throw new SalesLibraryError('template_changed_reload', 409);
      saveVersion(next, existing);
      template.updatedAt = stamp(existing.updatedAt);
      next.templates[next.templates.indexOf(existing)] = template;
    } else {
      if (body.expectedUpdatedAt != null && body.expectedUpdatedAt !== '') throw new SalesLibraryError('template_deleted_reload', 409);
      template.updatedAt = stamp(); next.templates.push(template);
    }
  } else if (action === 'duplicate') {
    const source = find(body.id);
    next.templates.push({ ...structuredClone(source), id: randomUUID(), title: `${source.title} (copie)`, position: Math.max(0, ...next.templates.filter(t => t.categoryId === source.categoryId).map(t => t.position)) + 10, updatedAt: stamp() });
  } else if (action === 'archive' || action === 'delete') {
    const template = find(body.id);
    saveVersion(next, template);
    if (action === 'archive') { template.status = 'archived'; template.updatedAt = stamp(template.updatedAt); }
    else next.templates = next.templates.filter(t => t.id !== template.id);
  } else if (action === 'restore') {
    const version = next.versions.find(v => v.id === identifier(body.versionId));
    if (!version) throw new SalesLibraryError('version_not_found');
    const restored = validTemplate(version.snapshot, next);
    const current = next.templates.find(t => t.id === restored.id);
    if (current) { saveVersion(next, current); next.templates = next.templates.filter(t => t.id !== current.id); }
    restored.updatedAt = stamp(current?.updatedAt); next.templates.push(restored);
  } else if (action === 'saveCategory') {
    const c = record(body.category);
    const category = { id: identifier(c.id), name: str(c.name, 100, true), position: position(c.position) };
    const i = next.categories.findIndex(c => c.id === category.id);
    if (i < 0) next.categories.push(category); else next.categories[i] = category;
  } else if (action === 'deleteCategory') {
    const id = identifier(body.id);
    if (!next.categories.some(c => c.id === id)) throw new SalesLibraryError('category_not_found');
    if (next.templates.some(t => t.categoryId === id)) throw new SalesLibraryError('category_not_empty');
    next.categories = next.categories.filter(c => c.id !== id);
  } else if (action === 'saveSettings') {
    const value = record(body.settings);
    next.settings = Object.fromEntries(settingsKeys.map(k => [k, str(value[k], 2000, true)])) as SalesSettings;
    if (!/^https:\/\//.test(next.settings.website)) throw new SalesLibraryError('https_website_required');
  } else if (action === 'saveVariable') {
    const v = record(body.variable); const id = identifier(v.id);
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(id) || own(centralKeys, id)) throw new SalesLibraryError('reserved_variable');
    const variable = { id, label: str(v.label, 150, true), defaultValue: str(v.defaultValue, 10000) };
    const i = next.variables.findIndex(v => v.id === id);
    if (i < 0) next.variables.push(variable); else next.variables[i] = variable;
  } else if (action === 'deleteVariable') {
    const id = identifier(body.id);
    if (!next.variables.some(v => v.id === id)) throw new SalesLibraryError('variable_not_found');
    next.variables = next.variables.filter(v => v.id !== id);
  } else if (action === 'reorder') {
    if (!Array.isArray(body.ids) || body.ids.length > next.templates.length) throw new SalesLibraryError('invalid_order');
    const ids = body.ids.map(identifier);
    if (new Set(ids).size !== ids.length) throw new SalesLibraryError('duplicate_order_id');
    ids.forEach((id, i) => { const t = find(id); saveVersion(next, t); t.position = i * 10; t.updatedAt = stamp(t.updatedAt); });
  } else throw new SalesLibraryError('unknown_action');
  return ordered(next);
}
export async function mutateSalesLibrary(input: unknown): Promise<SalesLibraryState> {
  const work = async () => {
    const stored = await readStored();
    const state = applySalesLibraryAction(stored.state, input);
    if (hasSalesDatabase()) {
      const sql = await pg();
      const changed = await sql`UPDATE sales_library_state SET state_json = ${JSON.stringify(state)}::jsonb,
        revision = revision + 1 WHERE id = 'main' AND revision = ${stored.revision} RETURNING revision`;
      if (!changed.length) throw new SalesLibraryError('library_changed_retry', 409);
    } else await writeLocal({ ...stored, revision: stored.revision + 1, state });
    return state;
  };
  return hasSalesDatabase() ? work() : localLock(work);
}
