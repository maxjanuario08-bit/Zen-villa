const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, values) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, URL, URLSearchParams, ...values });
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


test('campaign attribution allows distributed UTM values but strips booking, email and arbitrary parameters',()=>{
 const url=helpers.analyticsPageLocation('https://www.zen-villa.fr','/','?utm_source=instagram&utm_medium=social&utm_campaign=prospection&email=secret@example.com&token=secret');
 assert.equal(url,'https://www.zen-villa.fr/?utm_source=instagram&utm_medium=social&utm_campaign=prospection');
 assert.equal(helpers.analyticsPageLocation('https://www.zen-villa.fr','/','?utm_source=secret@example.com&utm_medium=social'),'https://www.zen-villa.fr/');
 assert.equal(helpers.analyticsReferrer('https://www.instagram.com/private-name?token=secret','https://www.zen-villa.fr'),'https://www.instagram.com/');
 assert.equal(helpers.analyticsReferrer('https://www.zen-villa.fr/compte?token=secret','https://www.zen-villa.fr'),'');
});
test('contact links map to separate intentions without exposing destinations',()=>{
 for(const [url,event] of [['tel:+33686401316','contact_phone'],['mailto:person@example.com?body=secret','contact_email'],['https://wa.me/33686401316?text=secret','contact_whatsapp'],['https://calendar.app.google/qPt4zxxzPdqE9mMV7','appointment_click']]) assert.equal(helpers.contactEvent(url),event);
 for(const url of ['/contact','javascript:alert(1)','https://calendar.app.google.evil.test/id'])assert.equal(helpers.contactEvent(url),null);
});
test('custom events honour consent, device exclusion and private routes; payload contains no form data',()=>{
 const calls=[];let consent='refused',optout=null;
 const window={location:{pathname:'/contact',origin:'https://www.zen-villa.fr'},gtag:(...args)=>calls.push(args)};
 const localStorage={getItem:key=>key===helpers.COOKIE_CONSENT_KEY?consent:optout};
 const h=load('lib/analytics.ts',{window,localStorage});
 h.trackSiteEvent('generate_lead','contact');assert.equal(calls.length,0);
 consent='accepted';optout='1';h.trackSiteEvent('generate_lead','contact');assert.equal(calls.length,0);
 optout=null;window.location.pathname='/en/admin';h.trackSiteEvent('contact_phone');assert.equal(calls.length,0);
 window.location.pathname='/contact';h.trackSiteEvent('generate_lead','contact');assert.equal(calls.length,1);
 assert.equal(calls[0][1],'generate_lead');assert.equal(calls[0][2].form_type,'contact');
 assert.deepEqual(Object.keys(calls[0][2]).sort(),['form_type','page_location','send_to']);
 window.gtag=()=>{throw Error('blocked')};assert.doesNotThrow(()=>h.trackSiteEvent('contact_phone'));
});
