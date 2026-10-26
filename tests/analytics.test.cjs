const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, values) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, ...values });
  return exports;
}
const helpers = load('lib/analytics.ts', {});
test('private and recovery routes are excluded in every language', () => {
  for (const prefix of ['', '/en', '/es', '/fr']) {
    for (const page of ['/admin', '/compte/mini-villa-pinson', '/equipe', '/connexion', '/inscription', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe']) assert.equal(helpers.analyticsPublicPath(prefix + page), false);
    assert.equal(helpers.analyticsPublicPath(prefix + '/logements/mini-villa-pinson'), true);
  }
});
test('no Google script before consent; route views counted once without URL queries; refusal disables Google', () => {
  const scripts = [];
  const window = { location: { origin: 'https://www.zen-villa.fr' } };
  const document = { title: 'Zenvilla', createElement: () => ({}), head: { appendChild: s => scripts.push(s) } };
  let path = '/';
  const ref = { current: '' };
  const component = load('components/GoogleAnalytics.tsx', { window, document, Date,
    require: name => ({
      react: { useEffect: fn => fn(), useRef: () => ref },
      'next/navigation': { usePathname: () => path },
      '@/lib/analytics': helpers,
    })[name],
  }).default;
  component({ consent: false });
  assert.equal(scripts.length, 0);
  path = '/admin'; component({ consent: true });
  assert.equal(scripts.length, 0);
  path = '/logements'; component({ consent: true }); component({ consent: true });
  assert.equal(scripts.length, 1);
  let views = window.dataLayer.filter(command => command[0] === 'event');
  assert.equal(views.length, 1);
  assert.equal(views[0][2].page_location, 'https://www.zen-villa.fr/logements');
  path = '/contact'; component({ consent: true });
  views = window.dataLayer.filter(command => command[0] === 'event');
  assert.equal(views.length, 2);
  component({ consent: false });
  assert.equal(window['ga-disable-G-0EWN4TFMJ2'], true);
});
