const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

test('authentication forms never fall back to GET before hydration', () => {
  const names = ['LoginForm', 'AdminLoginForm', 'StaffLoginForm', 'SignupForm', 'StaffSignupForm', 'PasswordRecoveryForm'];
  for (const name of names) {
    const filename = path.join(__dirname, '..', 'components', 'owner', `${name}.tsx`);
    const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let count = 0;
    function visit(node) {
      if (ts.isJsxOpeningElement(node) && node.tagName.getText(source) === 'form') {
        count++;
        const method = node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(source) === 'method');
        assert.equal(method?.initializer?.text, 'post', `${name} must keep credentials out of query strings without JavaScript`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    assert.ok(count > 0, `${name}: authentication form found`);
  }
});
