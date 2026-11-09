export type FaqEntry = {id:string;question:string;answer:string;keywords:string;href:string;linkLabel:string};
export function normalizeQuestion(value:string){
 return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
const stopWords=new Set("les des une pour est que qui avec vos votre mes mon quel quelle quelles quels dans puis peux peut vous nous sont faire savoir merci bonjour salut cherche cherche recherche besoin voudrais aimerais souhaite voulais souhaiterais voudrais avez aussi comment combien coute cout the and how can you what does this that have would like please hello your with much cost los las una con como del por para puedo quiero cuales cuanto cuesta gracias hola tienen esta tiene hay".split(" "));
const aliases:Record<string,string>={nettoyer:"menage",nettoyage:"menage",clean:"cleaning",blanchisserie:"linge",lessive:"linge",dej:"dejeuner",ptit:"petit",rdv:"rendez",dispo:"disponible",disponibilites:"disponible",disponibilite:"disponible",available:"availability",disponibilidad:"disponible",horaires:"heure"};
function words(value:string){return normalizeQuestion(value).split(" ").filter(word=>word.length>2&&!stopWords.has(word)).map(word=>Object.hasOwn(aliases,word)?aliases[word]:word);}
function matches(token:string,haystack:readonly string[]){return haystack.some(word=>word===token || (token.length>=4&&word.length>=4&&(word.startsWith(token)||token.startsWith(word))));}
export function searchFaq(entries:readonly FaqEntry[],query:string){
 const tokens=Array.from(new Set(words(query)));
 if(!tokens.length)return query.trim()?[]:[...entries];
 const rows=entries.map((entry,index)=>{
  const question=words(entry.question), keywords=words(entry.keywords), answer=words(entry.answer);
  let matched=0;
  const score=tokens.reduce((sum,token)=>{const value=matches(token,question)?6:matches(token,keywords)?3:matches(token,answer)?1:0;if(value)matched++;return sum+value;},0);
  return {entry,index,score,matched};
 });
 const availability=tokens.some(token=>["disponible","availability"].includes(token));
 if(availability&&tokens.some(token=>["rendez","appointment","meet","cita"].includes(token))){const entry=entries.find(entry=>entry.id==="rdv");if(entry)return [entry];}
 if(availability&&tokens.some(token=>["menage","cleaning","limpieza","transport","transfert","linge"].includes(token)))return [];
 if(availability){const entry=entries.find(entry=>entry.id==="live-availability");if(entry)return [entry];}
 return rows.filter(row=>row.score>0&&row.matched>=Math.ceil(tokens.length*0.6)).sort((a,b)=>b.score-a.score||b.matched-a.matched||a.index-b.index).map(row=>row.entry);
}
