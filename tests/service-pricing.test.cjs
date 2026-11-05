/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const vm=require('node:vm');
const catalog=require('../data/service-pricing.json');const providers=require('../data/service-providers.json');const exportsObject={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/service-pricing.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports:exportsObject,require:()=>catalog,Intl});const {priceText,pricingGroups}=exportsObject;
const labels={quote:'Sur devis',from:'À partir de',hour:'h',day:'jour',person:'personne',bed:'lit',purchases:'achats'};
test('on-request prices are not zero or invented; supplements and purchases stay explicit',()=>{
 assert.equal(priceText({mode:'quote',amount:null},'fr',labels),'Sur devis');
 const checkin=pricingGroups('owner','check-in')[0];assert.equal(checkin.rows[0].amount,35);assert.equal(checkin.rows[2].amount,60);assert.match(priceText(checkin.rows[3],'fr',labels),/^\+/);
 const shopping=pricingGroups('guest','courses')[0].rows.find(row=>row.amount===35 && row.extra==='purchases');assert.match(priceText(shopping,'fr',labels),/\+ achats$/);
});
test('three-day prices are supplied explicitly and are not multiplied from the daily rate',()=>{
 const paddle=pricingGroups('guest','equipement-nautique').find(group=>group.id==='plage').rows[0];assert.equal(paddle.amount,25);assert.equal(paddle.threeDays,60);
 const cot=catalog.find(group=>group.id==='famille').rows[0];assert.equal(cot.amount,8);assert.equal(cot.threeDays,20);
 for(const group of catalog)if(group.rows.some(row=>row.threeDays!==undefined))for(const row of group.rows)assert.ok(Number.isFinite(row.threeDays));
});
test('all prices have localized labels and valid amounts; unrelated owner/guest prices stay separated',()=>{
 const ids=new Set();for(const group of catalog)for(const row of group.rows){assert.ok(!ids.has(row.id));ids.add(row.id);for(const locale of ['fr','en','es'])assert.ok(row.label[locale]);assert.ok(row.mode==='quote'?row.amount===null:Number.isFinite(row.amount)&&row.amount>=0);}
 assert.equal(pricingGroups('guest','check-in').length,0);assert.equal(pricingGroups('owner','transport').length,0);
});
test('provider records have HTTPS URLs, verification dates and an explicit publication choice',()=>{for(const provider of providers){assert.equal(new URL(provider.url).protocol,'https:');assert.equal(typeof provider.enabled,"boolean");assert.ok(provider.verifiedOn);}});
