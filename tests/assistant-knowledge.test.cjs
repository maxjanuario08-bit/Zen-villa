/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');
function load(file){
 const filename=path.resolve(file);
 if(filename.endsWith('.json'))return JSON.parse(fs.readFileSync(filename,'utf8'));
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,URL,Intl,process:{env:{}},require(request){
  const base=request.startsWith('@/')?path.resolve(request.slice(2)):path.resolve(path.dirname(filename),request);
  return load(fs.existsSync(base)&&fs.statSync(base).isFile()?base:fs.existsSync(base+'.ts')?base+'.ts':path.join(base,'index.ts'));
 }});
 return exports;
}
const {buildAssistantKnowledge}=load('lib/assistant-knowledge.ts');
const {searchFaq}=load('lib/assistant-search.ts');
for(const locale of ['fr','en','es'])test(`${locale}: answers come from current public service, price and villa copy`,()=>{
 const copy=load(`messages/locales/${locale}/index.ts`).default;
 const entries=buildAssistantKnowledge(locale,{...copy,Admin:{secret:'PRIVATE-ADMIN'},Compte:{secret:'PRIVATE-OWNER'}});
 assert.ok(entries.length>80);
 assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
 for(const e of entries){assert.ok(e.question&&e.answer&&e.linkLabel);assert.ok(!e.href.includes('undefined'));assert.doesNotMatch(JSON.stringify(e),/PRIVATE-|Maxime|ni envoyée/);}
 assert.equal(entries.find(e=>e.id==='owner-menage').answer,[copy.ownerServices.menage.description,...copy.ownerServices.menage.details].join('\n'));
 assert.match(entries.find(e=>e.id==='price-accueil-accueil-0').answer,/35/);
 assert.match(entries.find(e=>e.id==='pinson-property').answer,/50/);
 const key=locale==='fr'?'ménage':locale==='en'?'cleaning':'limpieza';
 assert.ok(searchFaq(entries,key).length>0);
 assert.equal(searchFaq(entries,'zqxwvu extraterrestre kryptonite').length,0);
 assert.equal(searchFaq(entries,locale==='en'?'available next week':locale==='es'?'disponibilidad agosto':'dispo du 12 au 18 août')[0].id,'live-availability');
 assert.equal(searchFaq(entries,'constructor').length,0);
 assert.equal(searchFaq(entries,'ménage kryptonite').length,0);
 assert.equal(searchFaq(entries,'dispo rdv')[0].id,'rdv');
 assert.equal(searchFaq(entries,'dispo ménage').length,0);
 if(locale==='fr')assert.ok(searchFaq(entries,'je cherche le tarif du ménage studio')[0].id.startsWith('price-'));
});
test('public service copy changes are reflected without rewriting an FAQ answer',()=>{
 const copy=load('messages/locales/fr/index.ts').default;
 copy.ownerServices.menage.description='PUBLIC UPDATE';
 assert.match(buildAssistantKnowledge('fr',copy).find(e=>e.id==='owner-menage').answer,/PUBLIC UPDATE/);
});
