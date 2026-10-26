const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => name in mocks ? mocks[name] : require(name), Buffer, Date, console, URL, URLSearchParams, process: { env: { RESEND_API_KEY: 'test-only' }, cwd: () => process.cwd() } }, { filename: file });
  return exports;
}

function fixture() {
  const tokens = new Map();
  const credentials = new Map();
  const messages = [];
  let known = true;
  async function sql(parts, ...args) {
    const query = parts.join('?');
    if (query.includes('SELECT password_hash')) return credentials.has(`${args[0]}:${args[1]}`) ? [credentials.get(`${args[0]}:${args[1]}`)] : [];
    if (query.includes('INSERT INTO password_reset_tokens')) {
      tokens.set(args[0], { role: args[1], email: args[2], expires: Date.now() + 1800000 });
      return [];
    }
    if (query.includes('SELECT 1 FROM password_reset_tokens')) {
      const row = tokens.get(args[0]);
      return row && row.role === args[1] && row.expires > Date.now() ? [{}] : [];
    }
    if (query.includes('WITH consumed')) {
      const row = tokens.get(args[0]);
      if (!row || row.role !== args[1] || row.expires <= Date.now()) return [];
      tokens.delete(args[0]);
      credentials.set(`${row.role}:${row.email}`, { password_hash: args[2], changed_at: new Date() });
      return [{ email: row.email }];
    }
    return [];
  }
  const mocks = {
    '@/lib/owner-pg': { pg: async () => sql },
    '@/lib/owner-config': { databaseUrl: () => 'test-db', ownerAdminEmail: () => 'admin@example.com' },
    '@/lib/owner-accounts': { findAccountByEmail: async () => known ? {} : null, hashPassword: async p => `scrypt-test:${p}` },
    '@/lib/staff-accounts': { getStaffAccountByEmail: async () => known ? {} : null },
    '@/lib/mail': { sendMail: async m => { messages.push(m); return true; } },
    '@/lib/constants': { SITE: { url: 'https://www.zen-villa.fr' } },
  };
  return { service: load('lib/password-reset.ts', mocks), session: load('lib/password-credentials.ts', mocks), tokens, credentials, messages, unknown: () => known = false };
}

for (const role of ['admin', 'owner', 'staff']) {
  test(`${role}: recovery sends a localized HTTPS link; database stores only a hash; wrong role and reuse fail`, async () => {
    const f = fixture();
    const email = role === 'admin' ? 'admin@example.com' : 'person@example.com';
    await f.service.requestPasswordReset(role, email, 'es');
    assert.equal(f.messages.length, 1);
    assert.equal(f.messages[0].to, email);
    assert.match(f.messages[0].subject, /contraseña/);
    const link = new URL(f.messages[0].text.match(/https:\/\/\S+/)[0]);
    assert.equal(link.origin, 'https://www.zen-villa.fr');
    assert.equal(link.pathname, '/es/reinitialiser-mot-de-passe');
    const token = new URLSearchParams(link.hash.slice(1)).get('token');
    assert.match(token, /^[a-f0-9]{64}$/);
    assert.equal(f.tokens.has(token), false);
    assert.equal(f.tokens.has(crypto.createHash('sha256').update(token).digest('hex')), true);
    assert.equal(await f.service.completePasswordReset(role === 'admin' ? 'staff' : 'admin', token, 'new-password-long'), false);
    assert.equal(await f.service.completePasswordReset(role, token, 'short'), false);
    assert.equal(await f.service.completePasswordReset(role, token, 'new-password-long'), true);
    assert.equal(await f.service.completePasswordReset(role, token, 'another-password'), false);
  });
}

test('expired and malformed tokens cannot change credentials', async () => {
  const f = fixture();
  await f.service.requestPasswordReset('admin', 'admin@example.com', 'fr');
  for (const row of f.tokens.values()) row.expires = Date.now() - 1;
  const token = new URLSearchParams(new URL(f.messages[0].text.match(/https:\/\/\S+/)[0]).hash.slice(1)).get('token');
  assert.equal(await f.service.completePasswordReset('admin', token, 'long-password-here'), false);
  assert.equal(await f.service.completePasswordReset('admin', 'bad-token', 'long-password-here'), false);
  assert.equal(f.credentials.size, 0);
});

test('unknown account receives no reset email or token', async () => {
  const f = fixture(); f.unknown();
  await f.service.requestPasswordReset('owner', 'unknown@example.com', 'fr');
  await f.service.requestPasswordReset('admin', 'not-admin@example.com', 'fr');
  assert.equal(f.messages.length, 0);
  assert.equal(f.tokens.size, 0);
});

test('password reset invalidates old sessions and accepts newly issued sessions', async () => {
  const f = fixture();
  const now = Date.now();
  f.credentials.set('owner:person@example.com', { changed_at: new Date(now), password_hash: 'test' });
  const token = iat => Buffer.from(JSON.stringify({ iat })).toString('base64url') + '.signature';
  assert.equal(await f.session.sessionPasswordValid('owner', 'person@example.com', token(now - 1000)), false);
  assert.equal(await f.session.sessionPasswordValid('owner', 'person@example.com', token(undefined)), false);
  assert.equal(await f.session.sessionPasswordValid('owner', 'person@example.com', token(now + 1000)), true);
});

test('passwords use salted scrypt and reject incorrect passwords', async () => {
  const accounts = load('lib/owner-accounts.ts', { '@/lib/owner-pg': { usePostgres: () => false } });
  const password = 'test password with spaces';
  const a = await accounts.hashPassword(password);
  const b = await accounts.hashPassword(password);
  assert.notEqual(a, b);
  assert.equal(a.includes(password), false);
  assert.equal(await accounts.verifyPassword(password, a), true);
  assert.equal(await accounts.verifyPassword('incorrect-password', a), false);
});
