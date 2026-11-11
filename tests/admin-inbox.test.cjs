const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(path, dependencies) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, {
    exports, console: { error() {} }, URL,
    require: name => dependencies[name] ?? require(name),
  });
  return exports;
}

test("an inquiry is recorded before email and survives a notification failure", async () => {
  const operations = [];
  const { receiveInquiry } = load("lib/admin-inbox.ts", {
    "@/lib/owner-pg": { pg: async () => async (query, ...values) => {
      operations.push([query.join(""), values]);
    } },
  });
  await receiveInquiry("contact", { nom: "Test" }, "instagram", async () => {
    assert.match(operations[0][0], /INSERT INTO site_inquiries/);
    throw new Error("Resend unavailable");
  });
  assert.equal(operations[0][1][3], "instagram");
  assert.equal(operations[1][1][0], "failed");
});

test("email is not attempted when the database rejects the inquiry", async () => {
  const { receiveInquiry } = load("lib/admin-inbox.ts", {
    "@/lib/owner-pg": { pg: async () => async () => { throw new Error("Database unavailable"); } },
  });
  let attempted = false;
  await assert.rejects(receiveInquiry("service", {}, "", async () => { attempted = true; }), /Database unavailable/);
  assert.equal(attempted, false);
});

test("unauthenticated mailbox access never contacts Hostinger", async () => {
  let called = false;
  const { GET } = load("app/api/owner/admin/pilotage/[section]/route.ts", {
    "next/server": { NextResponse: { json: (body, options) => ({ body, ...options }) } },
    "@/lib/owner-admin": { getAdminSession: async () => null },
    "@/lib/admin-google": {},
    "@/lib/owner-pg": {},
    "@/lib/admin-mailbox": { readMailbox: async () => { called = true; } },
  });
  const response = await GET({}, { params: Promise.resolve({ section: "mail" }) });
  assert.equal(response.status, 401);
  assert.equal(response.headers["Cache-Control"], "private, no-store");
  assert.equal(called, false);
});
