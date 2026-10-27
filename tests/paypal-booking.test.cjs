/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,mocks,extra={}){
 const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{exports,require:n=>Object.hasOwn(mocks,n)?mocks[n]:require(n),process:{env:{},cwd:()=>process.cwd()},console:{info(){},warn(){},error(){}},URLSearchParams,Date,AbortSignal,Request,Response,...extra},{filename:file});return exports;
}
const row={id:'a'.repeat(24),slug:'mini-villa-pinson',guest_label:'Voyageur test',guest_email:'test@example.invalid',guest_phone:'+33100000000',check_in:new Date('2026-10-31T23:00:00Z'),check_out:new Date('2026-11-02T23:00:00Z'),guests:2,amount:'2.00',status:'pending',stay_id:''};
const booking={id:row.id,slug:row.slug,amount:2,checkIn:'2026-11-01',checkOut:'2026-11-03',guestLabel:'Test',guestEmail:'test@example.invalid',guests:2,stayId:'paypal-'+row.id};
function route({verified='VERIFIED',fulfillError=false,mail=true,fetchError=false}={}){
 const calls={fulfilled:0,notifications:0};
 const api=load('app/api/paypal/ipn/route.ts',{
  'next/server':{NextResponse:Response},'@/lib/constants':{CONTACT:{email:'contact@zen-villa.fr'}},
  '@/lib/pending-bookings':{getPendingBooking:async()=>booking,fulfillPaidBooking:async()=>{calls.fulfilled++;return fulfillError?{error:'overlap'}:{booking,fresh:false};}},
  '@/lib/site-mail':{notifyBookingConfirmed:async()=>{calls.notifications++;return mail;}}
 },{fetch:async()=>{if(fetchError)throw new Error('network');return new Response(verified);}});
 return{calls,post:async(patch={})=>api.POST(new Request('https://www.zen-villa.fr/api/paypal/ipn',{method:'POST',body:new URLSearchParams({payment_status:'Completed',custom:row.id,receiver_email:'contact@zen-villa.fr',txn_id:'TX-VERIFIED-TEST',mc_gross:'2.00',mc_currency:'EUR',...patch}).toString()}))};
}
test('PayPal verified completion creates stay and awaits owner/guest notifications; repeats retry delivery safely',async()=>{
 const r=route();assert.equal((await r.post()).status,200);assert.equal(r.calls.fulfilled,1);assert.equal(r.calls.notifications,1);
 assert.equal((await r.post()).status,200);assert.equal(r.calls.notifications,2);
});
test('unverified, wrong receiver, missing transaction, sandbox and wrong amounts never create a stay',async()=>{
 const invalid=route({verified:'INVALID'});assert.equal((await invalid.post()).status,400);assert.equal(invalid.calls.fulfilled,0);
 for(const patch of [{receiver_email:'other@example.invalid'},{txn_id:''},{test_ipn:'1'},{mc_gross:'NaN'},{mc_gross:'2.04'},{mc_currency:'USD'}]){const r=route();assert.equal((await r.post(patch)).status,400);assert.equal(r.calls.fulfilled,0);}
 const waiting=route();assert.equal((await waiting.post({payment_status:'Pending'})).status,200);assert.equal(waiting.calls.fulfilled,0);
});
test('transient verification, fulfillment and email failures request a PayPal retry instead of acknowledging success',async()=>{
 for(const options of [{fetchError:true},{fulfillError:true},{mail:false}])assert.equal((await route(options).post()).status,503);
});
test('Neon dates retain Paris calendar day; atomic serializable settlement is idempotent',async()=>{
 let record={...row};let writes=0;
 const sql=(parts)=>{const text=parts.join('?');if(text.includes('SELECT * FROM pending_bookings'))return Promise.resolve([{...record}]);return {text};};
 sql.transaction=async(queries,options)=>{assert.equal(options.isolationLevel,'Serializable');assert.match(queries[0].text,/INSERT INTO owner_stays/);assert.match(queries[0].text,/UPDATE pending_bookings/);writes++;record={...record,status:'paid',stay_id:'paypal-'+row.id};return[[{...record}]];};
 const api=load('lib/pending-bookings.ts',{'@/lib/owner-pg':{usePostgres:()=>true,pg:async()=>sql},'@/lib/owner-data':{createManualStay:async()=>{throw new Error('Nonatomic fallback must not run');}}});
 assert.equal((await api.getPendingBooking(row.id)).checkIn,'2026-11-01');
 const first=await api.fulfillPaidBooking(row.id,'TX-TEST');assert.equal(first.fresh,true);assert.equal(first.booking.checkOut,'2026-11-03');
 assert.equal((await api.fulfillPaidBooking(row.id,'TX-TEST')).fresh,false);assert.equal(writes,1);
});
test('owner email is retried independently; accepted guest/admin mails remain durably deduplicated',async()=>{
 const sent=new Set();const calls=[];let ownerFails=true;
 const sql=async(parts,...values)=>{if(parts.join('').includes('SELECT id'))return sent.has(values[0])?[{id:values[0]}]:[];sent.add(values[0]);return[];};
 const api=load('lib/site-mail.ts',{
  '@/lib/booking-confirmation-email':{bookingConfirmationEmail:()=>({subject:'Réservation confirmée – Mini Villa Pinson',text:'Confirmation',html:'<h1>Réservation confirmée</h1>'})},
  '@/lib/constants':{CONTACT:{email:'contact@zen-villa.fr',telephone:'+33686401316'}},'@/lib/logements':{getLogement:()=>({copyKey:'pinson'})},
  '@/lib/owner-accounts':{listOwnerAccountsForSlug:async()=>[{email:'owner@example.invalid'}]},
  '@/lib/owner-pg':{usePostgres:()=>true,pg:async()=>sql},
  '@/lib/mail':{sendMail:async(message)=>{calls.push(message);if(message.to==='owner@example.invalid'&&ownerFails)return false;return true;}}
 });
 assert.equal(await api.notifyBookingConfirmed(booking),false);assert.equal(calls.length,3);ownerFails=false;
 assert.equal(await api.notifyBookingConfirmed(booking),true);assert.equal(calls.length,4);assert.equal(calls[3].to,'owner@example.invalid');
 assert.equal(await api.notifyBookingConfirmed(booking),true);assert.equal(calls.length,4);assert.match(calls[0].idempotencyKey,/^booking-/);
});
