/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const vm=require('node:vm');
const exportsObject={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/owner-events.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsObject,Date,Intl});
const {completedOwnerEvents}=exportsObject;
const base={id:'stay',slug:'villa',guestKey:'guest',checkIn:'2026-07-01',checkOut:'2026-07-05',guests:2,status:'paid'};
const now=Date.parse('2026-11-04T20:00:00Z');
test('past bookings do not fabricate check-in or check-out completion',()=>{assert.equal(completedOwnerEvents([base],[],now).length,0);});
test('history includes all recorded operations with their own photos, actor and chronological order',()=>{
 const stay={...base,checkedInBy:'Alex',checkInTime:'15:00',checkedOutAt:'2026-07-05T09:00:00Z',checkedOutBy:'Sam',checkOutPhotos:['/api/owner/uploads/out.jpg']};
 const cleaning={id:'clean',slug:'villa',stayId:'stay',date:'2026-07-05',time:'12:00',cleanerId:'Camille',photos:['/api/owner/uploads/clean.jpg']};
 const rows=completedOwnerEvents([stay],[cleaning],now);
 assert.deepEqual(Array.from(rows,row=>row.kind),['cleaning','check-out','check-in']);
 assert.equal(rows[0].by,'Camille');assert.equal(rows[0].photos[0],cleaning.photos[0]);assert.equal(rows[1].time,'11:00');assert.equal(rows[1].photos[0],stay.checkOutPhotos[0]);
 assert.equal(rows[2].timestamp,Date.parse('2026-07-01T13:00:00Z'));
});
test('future and invalid events are excluded and standalone past cleanings remain visible',()=>{
 const clean=(date,time)=>({id:date,slug:'villa',stayId:'deleted',date,time,cleanerId:'Sam',photos:[]});
 const rows=completedOwnerEvents([{...base,checkIn:'2027-01-01',checkedInBy:'Sam',checkInTime:'15:00'}],[clean('2027-01-01','10:00'),clean('2026-10-01','10:00'),clean('invalid','10:00')],now);
 assert.equal(rows.length,1);assert.equal(rows[0].date,'2026-10-01');
});
