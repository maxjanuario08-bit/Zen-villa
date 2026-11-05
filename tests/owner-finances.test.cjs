/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const vm=require('node:vm');
function load(file,mocks={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:id=>mocks[id]||require(id),Date,Intl});return exports;}
const booking=load('lib/booking.ts');const {yearFinance}=load('lib/owner-finances.ts',{'@/lib/booking':booking});
const config={defaultNightly:100,cleaningFee:0,seasons:[],blocked:[],currency:'EUR',enabled:true,minNights:2};
test('a stay spanning two years is allocated to the nights of each selected year without double counting',()=>{
 const stays=[{id:'1',checkIn:'2026-12-30',checkOut:'2027-01-03'}];
 const first=yearFinance(stays,config,2026),second=yearFinance(stays,config,2027);
 assert.equal(first.nights,2);assert.equal(second.nights,2);assert.equal(first.lodging,200);assert.equal(second.lodging,200);assert.equal(first.fee,40);assert.equal(first.net,160);assert.equal(first.lodging+second.lodging,400);
});
test('an empty year has zero figures',()=>{const result=yearFinance([],config,2026);assert.equal(result.nights,0);assert.equal(result.lodging,0);assert.equal(result.fee,0);});
