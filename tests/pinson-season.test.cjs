/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const vm=require('node:vm');
function readModule(path){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,Date});return exports;}
const config=readModule('lib/logements.ts').getLogement('mini-villa-pinson').booking;const booking=readModule('lib/booking.ts');
test('Pinson test rate removed and all November nights are closed every year',()=>{
 assert.ok(!config.dateOverrides?.length);
 for(const year of [2026,2027])for(let day=1;day<=30;day++)assert.equal(booking.isNightUnavailable(`${year}-11-${String(day).padStart(2,'0')}`,config),true);
 assert.equal(booking.rangeIsAvailable('2026-11-01','2026-11-03',config),false);
 assert.ok(booking.nightlyRate('2026-11-01',config)>1);
});
test('Pinson winter closure and March reopening preserve the regular season',()=>{
 for(const day of ['2026-12-15','2027-01-10','2027-03-02'])assert.equal(booking.isNightUnavailable(day,config),true);
 assert.equal(booking.isNightUnavailable('2027-03-03',config),false);
 assert.equal(booking.rangeIsAvailable('2027-03-03','2027-03-08',config),true);
 assert.equal(booking.nightlyRate('2027-03-03',config),80);
 assert.equal(booking.isNightUnavailable('2027-10-31',config),false);
});
