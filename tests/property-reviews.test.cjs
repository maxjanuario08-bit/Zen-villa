/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('data/pinson-reviews.json','utf8'));
test('source counts and rating scales remain separate from the 35 supplied comments',()=>{
 assert.equal(data.reviews.length,35);assert.deepEqual(data.platforms.map(p=>[p.id,p.rating,p.scale,p.count]),[['booking',9,10,9],['airbnb',4.7,5,10],['abritel',9,10,17]]);
 assert.equal(new Set(data.reviews.map(r=>r.id)).size,35);for(const r of data.reviews){const p=data.platforms.find(p=>p.id===r.platform);assert.ok(p);assert.ok(r.rating>=0&&r.rating<=p.scale);assert.ok(!r.date||/^\d{4}-\d{2}(-\d{2})?$/.test(r.date));}
});
test('Abritel and Airbnb wording is copied verbatim, with platform translations and archive status retained',()=>{
 const hashes=JSON.parse(fs.readFileSync('tests/pinson-source-hashes.json','utf8'));
 const {createHash}=require('node:crypto');
 // Digests recorded after comparing each supplied comment against the source copy.
 for(const r of data.reviews.filter(r=>r.platform!=='booking')){assert.equal(createHash('sha256').update(r.text).digest('hex'),hashes[r.id],r.id);if(r.platform==='airbnb'){assert.equal(r.platformTranslated,true);assert.equal(r.language,'es');}}
 assert.ok(data.reviews.find(r=>r.author==='Thomas O.').archived);assert.equal(data.reviews.find(r=>r.author==='Thomas O.').rating,4);assert.match(data.reviews.find(r=>r.author==='catherine d.').text,/décibels/);
 assert.equal(data.reviews.find(r=>r.author==='Sönke F.').title,'');assert.match(data.reviews.find(r=>r.author==='Sönke F.').text,/few more sharp knives/);
});
test('unknown identity/date stay unknown and blank Booking comment is never invented',()=>{
 assert.equal(data.reviews.find(r=>r.author==='Audrey').text,'');assert.equal(data.reviews.filter(r=>r.author===null).length,2);
 assert.ok(data.reviews.some(r=>r.date===null));assert.ok(data.platforms.every(p=>p.url===null||/^https:\/\//.test(p.url)));
 assert.match(data.reviews.find(r=>r.author==='Fred973').negative,/plus de place dans la cuisine/);assert.match(data.reviews.find(r=>r.author==='Pumbo90').negative,/Materasso/);
});
test('French English Spanish interface labels have matching keys',()=>{
 const keys=lang=>[...fs.readFileSync(`messages/locales/${lang}/propertyReviews.ts`,'utf8').matchAll(/^  "([^"]+)":/gm)].map(m=>m[1]);assert.deepEqual(keys('fr'),keys('en'));assert.deepEqual(keys('fr'),keys('es'));
});
