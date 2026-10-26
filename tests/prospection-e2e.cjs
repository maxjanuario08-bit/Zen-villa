/* eslint-disable @typescript-eslint/no-require-imports */
/* Run against the isolated development server only. No external messages are sent. */
const assert=require('node:assert/strict');
const Excel=require('exceljs');
const fs=require('node:fs');
const base=process.env.TEST_BASE_URL||'http://localhost:3015';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Test data must never be created in production');
(async()=>{
 const paths=['/api/owner/admin/prospection','/api/owner/admin/prospection/sources','/api/owner/admin/prospection/export?format=xlsx','/api/owner/admin/sales-library'];
 for(const path of paths)assert.equal((await fetch(base+path)).status,401);
 const login=await fetch(base+'/api/owner/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'contact@zen-villa.fr',password:process.env.TEST_ADMIN_PASSWORD||'local-verification-only'})});assert.equal(login.status,200);
 const Cookie=login.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ');
 const req=async(path,body,method='POST')=>{const r=await fetch(base+path,{method:body?method:'GET',headers:{Cookie,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});return{status:r.status,data:await r.json()};};
 const suffix=Date.now();const date=new Date().toISOString().slice(0,10);const prefix='/api/owner/admin/prospection';
 const leadInput={property:`Villa TEST NON RÉELLE ${suffix}`,name:'Contact de test fictif',email:`crm-test-${suffix}@example.invalid`,phone:'+331'+String(suffix).slice(-8),zone:'santa-giulia',profile:{propertyType:'villa',sourceId:`test-${suffix}`,sourceUrl:'https://example.invalid/contact',sourcePublisher:'Test automatisé isolé',sourceLicense:'Données fictives de test',qualification:'unreviewed'}};
 const created=await req(prefix,leadInput);assert.equal(created.status,201);const id=created.data.lead.id;
 assert.equal((await req(prefix,leadInput)).status,409);
 const blocked=await req(prefix,{action:'interaction',id,channel:'email',outcome:'confirmed',message:'Test de blocage'});assert.equal(blocked.status,403);
 const updated=await req(prefix,{id,notes:'Notes persistantes de vérification',profile:{operatorType:'independent',qualification:'confirmed',verifiedAt:date,expiresAt:'2030-12-31',emailNature:'professional',phoneNature:'professional',lawfulBasis:'legitimate-interest',lawfulBasisNote:'Offre en rapport avec une activité professionnelle confirmée — test fictif.',firstName:'Prénom fictif',lastName:'Nom fictif',salutation:'Bonjour',evidence:[{field:'email',value:leadInput.email,url:'https://example.invalid/contact',publisher:'Test',license:'Données fictives',collectedAt:date,sourceUpdatedAt:date,checkedAt:date},{field:'phone',value:leadInput.phone,url:'https://example.invalid/contact',publisher:'Test',license:'Données fictives',collectedAt:date,sourceUpdatedAt:date,checkedAt:date}]}},'PATCH');assert.equal(updated.status,200);
 const read=await req(prefix+'?id='+id);assert.equal(read.data.lead.notes,'Notes persistantes de vérification');
 assert.equal((await req(prefix,{action:'interaction',id,channel:'email',outcome:'prepared',message:'Texte de test sans envoi'})).status,200);
 assert.equal((await req(prefix,{action:'interaction',id,channel:'email',outcome:'confirmed',message:'Bonjour {{nom}}'})).status,400);
 assert.equal((await req(prefix,{action:'interaction',id,channel:'whatsapp',outcome:'prepared',message:'Test'})).status,403);
 const task=await req(prefix+'/tasks',{prospectId:id,title:'Tâche de vérification locale',due:date});assert.equal(task.status,200);
 assert.equal((await req(prefix+'/tasks',{...task.data.task,done:true})).status,200);
 const xlsx=await fetch(base+prefix+'/export?format=xlsx&q='+encodeURIComponent(String(suffix)),{headers:{Cookie}});assert.equal(xlsx.status,200);const bytes=await xlsx.arrayBuffer();const book=new Excel.Workbook();await book.xlsx.load(bytes);assert.deepEqual(book.worksheets.map(s=>s.name),['Logements','Contacts validés','Sources','Suivi']);assert.equal(book.getWorksheet('Logements').getCell('H2').text,leadInput.email);fs.writeFileSync('/private/tmp/zenvilla-export-verification.xlsx',Buffer.from(bytes));
 const converted=await req(prefix,{action:'convert',id});assert.equal(converted.status,200);const again=await req(prefix,{action:'convert',id});assert.equal(again.data.client.id,converted.data.client.id);
 const second=await req(prefix,{...leadInput,property:leadInput.property+' deuxième',profile:{...leadInput.profile,sourceId:leadInput.profile.sourceId+'-2'}});assert.equal(second.status,201);
 assert.equal((await req(prefix,{id,status:'opted-out'},'PATCH')).status,200);
 const affected=await req(prefix+'?id='+second.data.lead.id);assert.equal(affected.data.lead.suppressed,true);
 assert.equal((await req(prefix,{action:'interaction',id:second.data.lead.id,channel:'email',outcome:'confirmed',message:'Doit rester bloqué'})).status,403);
 const csv=await fetch(base+prefix+'/export?format=csv&q='+suffix,{headers:{Cookie}});assert.equal((await csv.text()).includes(leadInput.email),false);
 const library=await req('/api/owner/admin/sales-library');assert.equal(library.status,200);assert.equal(library.data.templates.length,25);
 const template=library.data.templates.find(t=>t.id==='email-01');const edited={...template,description:'Description persistante test local '+suffix};
 assert.equal((await req('/api/owner/admin/sales-library',{action:'saveTemplate',template:edited,expectedUpdatedAt:template.updatedAt})).status,200);
 const reloaded=await req('/api/owner/admin/sales-library');assert.equal(reloaded.data.templates.find(t=>t.id===template.id).description,edited.description);
 console.log('OK : accès admin, dédoublonnage, validation, historique, tâches, XLSX 4 onglets, conversion idempotente, opposition transversale, WhatsApp distinct et bibliothèque persistante.');
})().catch(e=>{console.error(e);process.exitCode=1;});
