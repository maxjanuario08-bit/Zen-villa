/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const vm=require('node:vm');
function moduleFrom(path,environment={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,process:{env:environment},URL});return exports;}
test('appointment URLs accept only public Google appointment links and reject private calendars and malicious protocols',()=>{
 const {googleAppointmentUrl}=moduleFrom('lib/appointments.ts');
 for(const value of ['https://calendar.app.google/abc123','https://calendar.google.com/calendar/appointments/schedules/AcZssZ123'])assert.equal(googleAppointmentUrl(value),value);
 for(const value of [undefined,'','javascript:alert(1)','https://example.com/calendar/appointments/schedules/a','https://calendar.google.com/calendar/u/0/r','https://calendar.app.google.evil.com/a','https://user:pass@calendar.app.google/a'])assert.equal(googleAppointmentUrl(value),null);
 assert.equal(moduleFrom('lib/appointments.ts').APPOINTMENT_URL,'https://calendar.app.google/qPt4zxxzPdqE9mMV7');
 assert.equal(moduleFrom('lib/appointments.ts',{NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL:'https://calendar.app.google/override'}).APPOINTMENT_URL,'https://calendar.app.google/override');
 assert.equal(moduleFrom('lib/appointments.ts',{NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL:'javascript:alert(1)'}).APPOINTMENT_URL,'https://calendar.app.google/qPt4zxxzPdqE9mMV7');
});
test('FAQ translations have the same 15 real topics and only existing site routes',()=>{
 const data=JSON.parse(fs.readFileSync('data/assistant-faq.json','utf8'));
 for(const locale of ['fr','en','es']){assert.equal(data[locale].length,15);assert.deepEqual(data[locale].map(r=>r.id),data.fr.map(r=>r.id));for(const entry of data[locale]){assert.ok(entry.question&&entry.answer&&entry.keywords&&entry.linkLabel);assert.ok(/^\/(contact|formules|services|demander-prestation|compte|logements|voyageurs)(\/|#|$)/.test(entry.href));assert.doesNotMatch(entry.answer,/20\s*%|impeccable|premium|revenus garantis/i);}}
});
test('local search handles accents, localized questions and unknown input without fabricating answers',()=>{
 const faq=JSON.parse(fs.readFileSync('data/assistant-faq.json','utf8'));const {searchFaq}=moduleFrom('lib/assistant-search.ts');
 assert.equal(searchFaq(faq.fr,'ménage')[0].id,'menage');assert.equal(searchFaq(faq.en,'cleaning')[0].id,'menage');assert.equal(searchFaq(faq.es,'limpieza')[0].id,'menage');
 assert.equal(searchFaq(faq.fr,'zqxwvu').length,0);assert.equal(searchFaq(faq.fr,'').length,15);assert.equal(searchFaq(faq.fr,'Comment bloquer mes dates ?')[0].id,'dates');
});
