/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}, cwd = process.cwd()) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { exports, require: n => n === '@/lib/local-crm-path' ? { localCrmPath: (name, folder='data') => path.join(cwd,folder,name) } : n === './sales-library-render' ? renderer : Object.hasOwn(mocks, n) ? mocks[n] : require(n), structuredClone, Date, console, URL, process: { env: { NODE_ENV: 'test' }, cwd: () => cwd } }, { filename: file });
  return exports;
}
const seed = load('lib/sales-library-seed.ts');
const renderer = load('lib/sales-library-render.ts');
function fixture(cwd) {
  return load('lib/sales-library.ts', { '@/lib/owner-pg': { usePostgres: () => false }, './sales-library-seed': seed, './sales-library-render': renderer }, cwd);
}
const api = fixture();
const action = api.applySalesLibraryAction;
const plain = value => JSON.parse(JSON.stringify(value));
test('25 seed templates, correct category totals, independent call sections and prudent email06', () => {
  const state = seed.initialSalesLibrary();
  assert.equal(state.templates.length, 25);
  assert.deepEqual(plain(state.categories.map(c => state.templates.filter(t => t.categoryId === c.id).length)), [6,4,5,4,6]);
  for (const template of state.templates.filter(t => t.categoryId === 'appels')) assert.ok(template.sections.length >= 3);
  assert.match(state.templates.find(t => t.id === 'email-06').content, /Voici notre proposition/);
  assert.doesNotMatch(state.templates.find(t => t.id === 'email-06').content, /ci-joint/);
  for (const template of state.templates.filter(t => t.categoryId === 'argumentaires')) assert.ok(template.sections.length >= 5);
});
test('missing data stays missing; inherited, unknown and prototype variables cannot render', () => {
  const state = seed.initialSalesLibrary();
  const t = { ...state.templates[0], subject: '{{entreprise}}', content: '{{prenom}} {{nom}} {{constructor}} {{toString}} {{unknown}} {{telephone_zenvilla}}', sections: [] };
  const inherited = Object.create({ prenom: 'Inventé', unknown: 'Invisible' });
  inherited.nom = 'Martin'; inherited.telephone_zenvilla = 'Attaquant';
  const result = api.renderSalesTemplate(t, inherited, state.settings);
  assert.equal(result.subject, 'Zen Villa');
  assert.match(result.content, /Martin/);
  assert.match(result.content, /\+33 6 86 40 13 16/);
  assert.deepEqual(plain(result.missing), ['prenom','constructor','toString','unknown']);
  assert.doesNotMatch(result.content, /Inventé|Invisible|Attaquant/);
});
test('new settings render in signatures without overwriting independently edited literal text', () => {
  const state = seed.initialSalesLibrary();
  const settings = { ...state.settings, phone: '+33 1 00 00 00 00' };
  const result = api.renderSalesTemplate(state.templates[0], {}, settings);
  assert.match(result.content, /\+33 1 00 00 00 00/);
  assert.ok(result.missing.includes('nom'));
});
test('save, stale edit conflict, duplicate, archive, delete and restore preserve snapshots', () => {
  let state = seed.initialSalesLibrary();
  const t = state.templates[0];
  state = action(state, { action: 'saveTemplate', template: { ...t, content: 'Nouvelle phrase' }, expectedUpdatedAt: t.updatedAt });
  assert.equal(state.templates.find(x => x.id === t.id).content, 'Nouvelle phrase');
  assert.equal(state.versions[0].snapshot.content, t.content);
  assert.throws(() => action(state, { action:'saveTemplate', template: t, expectedUpdatedAt: t.updatedAt }), e => e.status === 409);
  const previous = state.versions[0].id;
  state = action(state, { action:'duplicate', id:t.id });
  assert.equal(state.templates.length, 26);
  state = action(state, { action:'archive', id:t.id });
  assert.equal(state.templates.find(x => x.id === t.id).status, 'archived');
  state = action(state, { action:'delete', id:t.id });
  assert.equal(state.templates.some(x => x.id === t.id), false);
  assert.throws(() => action(state, { action:'saveTemplate', template:t, expectedUpdatedAt:t.updatedAt }), e => e.status === 409);
  state = action(state, { action:'restore', versionId:previous });
  assert.equal(state.templates.find(x => x.id === t.id).content, t.content);
});
test('category CRUD rejects nonempty deletes, variable CRUD and partial reorder validate IDs', () => {
  let state = seed.initialSalesLibrary();
  assert.throws(() => action(state, { action:'deleteCategory', id:'emails' }), /category_not_empty/);
  state = action(state, { action:'saveCategory', category:{ id:'custom', name:'Personnalisé', position:70 } });
  state = action(state, { action:'deleteCategory', id:'custom' });
  state = action(state, { action:'saveVariable', variable:{ id:'custom_variable', label:'Exemple', defaultValue:'Test' } });
  const t = { ...state.templates[0], subject:'{{custom_variable}}', content:'', sections:[] };
  assert.deepEqual(plain(api.renderSalesTemplate(t, { custom_variable:'Test' }, state.settings).missing), ['custom_variable']);
  assert.equal(api.renderSalesTemplate(t, { custom_variable:'Test', __salesVariableIds:state.variables.map(v => v.id) }, state.settings).subject, 'Test');
  state = action(state, { action:'deleteVariable', id:'custom_variable' });
  assert.throws(() => action(state, { action:'saveVariable', variable:{ id:'constructor', label:'Bad', defaultValue:'' } }), /invalid_id/);
  state = action(state, { action:'reorder', ids:['email-02','email-01'] });
  assert.equal(state.templates.find(t => t.id === 'email-02').position, 0);
  assert.throws(() => action(state, { action:'reorder', ids:['email-01','email-01'] }), /duplicate_order_id/);
});
test('local persistence survives module reload; deleted seeds never return', async () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'sales-library-test-'));
  try {
    const store = fixture(cwd);
    let state = await store.getSalesLibrary();
    const t = state.templates[0];
    await store.mutateSalesLibrary({ action:'saveTemplate', template:{ ...t, content:'Persisté' }, expectedUpdatedAt:t.updatedAt });
    await store.mutateSalesLibrary({ action:'delete', id:'email-02' });
    state = await fixture(cwd).getSalesLibrary();
    assert.equal(state.templates.find(x => x.id === t.id).content, 'Persisté');
    assert.equal(state.templates.some(x => x.id === 'email-02'), false);
    const file = JSON.parse(fs.readFileSync(path.join(cwd,'.data/sales-library.json')));
    assert.ok(file.seedVersion.includes('email06-no-attachment'));
    // A corrupt store must not silently reset to seed data.
    fs.writeFileSync(path.join(cwd,'.data/sales-library.json'), 'broken');
    await assert.rejects(() => fixture(cwd).getSalesLibrary());
  } finally { fs.rmSync(cwd, { recursive:true, force:true }); }
});
test('database CAS protects concurrent edits and ON CONFLICT seed never overwrites data', async () => {
  let row; let race = false;
  async function sql(parts, ...args) {
    const query = parts.join('?');
    if (query.includes('CREATE TABLE')) return [];
    if (query.includes('INSERT INTO')) { assert.match(query, /ON CONFLICT \(id\) DO NOTHING/); row ??= { revision:0, seed_version:args[0], state_json:JSON.parse(args[1]) }; return []; }
    if (query.includes('SELECT')) return [structuredClone(row)];
    if (query.includes('UPDATE')) {
      if (race || args[1] !== row.revision) return [];
      row.state_json = JSON.parse(args[0]); row.revision++; return [{ revision:row.revision }];
    }
    throw Error('Unexpected SQL');
  }
  const make = () => load('lib/sales-library.ts', { '@/lib/owner-pg':{ usePostgres:()=>true, pg:async()=>sql }, './sales-library-seed':seed });
  const store = make();
  await store.getSalesLibrary();
  await store.mutateSalesLibrary({ action:'delete', id:'email-01' });
  assert.equal((await make().getSalesLibrary()).templates.some(t => t.id === 'email-01'), false);
  race = true;
  await assert.rejects(() => store.mutateSalesLibrary({ action:'archive', id:'email-02' }), e => e.status === 409);
  assert.equal(row.state_json.templates.find(t => t.id === 'email-02').status, 'active');
});
test('API gates GET and POST with existing admin authorization and rejects cross-origin writes', async () => {
  let authorized = false; let reads = 0;
  const route = load('app/api/owner/admin/sales-library/route.ts', {
    'next/server':{ NextResponse:{ json:(body, options={})=>({ body, status: options.status ?? 200, headers:options.headers }) } },
    '@/lib/owner-admin':{ adminRequestOk:async()=>authorized },
    '@/lib/sales-library':{ ...api, getSalesLibrary:async()=>{reads++;return seed.initialSalesLibrary()}, mutateSalesLibrary:async()=>{ throw new api.SalesLibraryError('conflict',409) } },
  });
  const req = (body='{}', origin='https://www.zen-villa.fr') => new Request('https://www.zen-villa.fr/api/owner/admin/sales-library',{ method:'POST', headers:{ origin },body });
  assert.equal((await route.GET(req())).status,401);
  assert.equal((await route.POST(req())).status,401);
  assert.equal(reads,0);
  authorized = true;
  assert.equal((await route.GET(req())).status,200);
  assert.equal((await route.POST(req('{}','https://evil.test'))).status,403);
  assert.equal((await route.POST(req('not json'))).status,400);
  assert.equal((await route.POST(req('{}'))).status,409);
});
