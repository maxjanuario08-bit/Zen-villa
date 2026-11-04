export type FaqEntry = {id:string;question:string;answer:string;keywords:string;href:string;linkLabel:string};
export function normalizeQuestion(value:string){
 return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
export function searchFaq(entries:readonly FaqEntry[],query:string){
 const tokens=normalizeQuestion(query).split(" ").filter(token=>token.length>2&&!new Set(["les","des","une","pour","est","que","qui","avec","the","and","how","can","you","what","los","las","una","con","como","del","por","vos","votre","mes","mon"]).has(token));
 if(!tokens.length)return query.trim()?[]:[...entries];
 return entries.map((entry,index)=>({entry,index,score:tokens.reduce((sum,token)=>sum+(normalizeQuestion(entry.question).includes(token)?6:normalizeQuestion(entry.keywords).includes(token)?3:normalizeQuestion(entry.answer).includes(token)?1:0),0)})).filter(row=>row.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).map(row=>row.entry);
}
