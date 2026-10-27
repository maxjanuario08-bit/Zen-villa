/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
function load(file,mocks={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports,require:n=>mocks[n]||require(n),URL,Date,Intl},{filename:file});return exports;}
const constants=load('lib/constants.ts');const logement=load('lib/logements.ts').getLogement('mini-villa-pinson');
const {bookingConfirmationEmail}=load('lib/booking-confirmation-email.ts',{'@/lib/constants':constants});
const booking={id:'test-preview',slug:'mini-villa-pinson',guestLabel:'Maxime',guestEmail:'test@example.invalid',guestPhone:'',checkIn:'2026-11-01',checkOut:'2026-11-03',guests:2,amount:2,status:'paid',stayId:'test',createdAt:''};
test('supplied confirmation layout uses the actual villa, visitor, French dates, total and working guest links',()=>{
 const {html,text,subject}=bookingConfirmationEmail(booking,logement);
 for(const value of ['Bonjour Maxime','Mini Villa Pinson','1 novembre 2026','3 novembre 2026','2 nuits','2 voyageurs','MONTANT RÉGLÉ','VOTRE ARRIVÉE','VOTRE DÉPART','UNE QUESTION'])assert.ok(html.includes(value),value);
 assert.match(subject,/Mini Villa Pinson/);assert.match(html,/logements\/pinson\/exterieur.jpg/);assert.match(html,/livret\/mini-villa-pinson/);assert.match(html,/tel:\+33686401316/);assert.match(html,/mailto:contact@zen-villa.fr/);assert.match(text,/À partir de 15h/);assert.match(text,/Au plus tard à 11h/);assert.doesNotMatch(html,/frais de ménage|paypal\.com|<script/i);
});
test('another property and guest never inherit Pinson photo, timings or identity; cent amounts stay accurate',()=>{
 const other={slug:'villa-test',copyKey:'test',image:'/logements/villa-test.jpg',confirmation:{name:'Villa Test',location:'Lecci',arrivalTime:'16h',departureTime:'10h'}};
 const {html,text}=bookingConfirmationEmail({...booking,slug:other.slug,guestLabel:'Camille',guests:1,amount:245.75,checkOut:'2026-11-02'},other);
 assert.match(html,/Bonjour Camille/);assert.match(html,/Villa Test/);assert.match(text,/1 nuit\)/);assert.match(text,/1 voyageur\n/);assert.match(text,/245,75/);assert.match(html,/livret\/villa-test/);assert.match(text,/16h/);assert.doesNotMatch(html,/Pinson|Bonjour Maxime|2 nuits/);
});
test('guest and property text is escaped and foreign asset URLs cannot be injected',()=>{
 const {html}=bookingConfirmationEmail({...booking,guestLabel:'<img src=x onerror="alert(1)">'},{...logement,image:'https://untrusted.example/photo.jpg',confirmation:{...logement.confirmation,name:'Villa <script>x</script>'}});
 assert.doesNotMatch(html,/<script>|<img src=x|untrusted\.example/);assert.match(html,/&lt;img/);assert.match(html,/&lt;script&gt;/);
});
test('transport sends both HTML and plain-text with existing idempotency header',async()=>{
 let payload,headers;const exports={};const code=ts.transpileModule(fs.readFileSync('lib/mail.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 vm.runInNewContext(code,{exports,require:()=>constants,process:{env:{RESEND_API_KEY:'test-only'}},console,fetch:async(url,options)=>{payload=JSON.parse(options.body);headers=options.headers;return{ok:true};}});
 const email=bookingConfirmationEmail(booking,logement);assert.equal(await exports.sendMail({to:'test@example.invalid',...email,idempotencyKey:'test-only-key'}),true);assert.equal(payload.html,email.html);assert.equal(payload.text,email.text);assert.equal(headers['Idempotency-Key'],'test-only-key');
});
if(process.env.ZV_EMAIL_PREVIEW_DIR){fs.mkdirSync(process.env.ZV_EMAIL_PREVIEW_DIR,{recursive:true});fs.writeFileSync(process.env.ZV_EMAIL_PREVIEW_DIR+'/index.html',bookingConfirmationEmail(booking,logement).html);}
