import faq from "@/data/assistant-faq.json";
import {servicePricing, priceText} from "@/lib/service-pricing";
import {logementsForRent} from "@/lib/logements";
import type {FaqEntry} from "@/lib/assistant-search";

type ServiceCopy = {label:string;description:string;details:readonly string[]};
type PublicCopy = {
 ownerServices:Record<string,ServiceCopy>;
 guestServices:Record<string,ServiceCopy>;
 Pricing:Record<string,string>;
 Assistant:Record<string,string>;
 ContactPresentation:Record<string,string>;
 Titles:Record<string,string>;
 PropertyReviews:Record<string,string>;
 Logements:{seeProperty:string;guestsLabel:string;bedroomsLabel:string;booking:Record<string,string>;pinson:{title?:string;name?:string;description:string;highlights:readonly string[];amenityGroups:readonly {title:string;items:readonly string[]}[]}};
};
/** Only explicitly selected public copy is sent to the assistant. No accounts, bookings or CRM data. */
export function buildAssistantKnowledge(locale:string, messages:unknown):FaqEntry[] {
 const copy=messages as PublicCopy;
 const language=locale as keyof typeof faq;
 const entries:FaqEntry[]=[...(faq[language] || faq.fr)];
 const add=(id:string,question:string,answer:string,href:string,linkLabel:string,keywords="")=>{
  if(question&&answer) entries.push({id,question,answer,href,linkLabel,keywords});
 };
 for(const [kind,services] of [["owner",copy.ownerServices],["guest",copy.guestServices]] as const){
  for(const [slug,service] of Object.entries(services)){
   add(`${kind}-${slug}`,service.label,[service.description,...service.details].join("\n"),`${kind==="owner"?"/services":"/voyageurs"}/${slug}`,service.label);
  }
 }
 for(const group of servicePricing){
  if (group.audience === "owner") continue;
  for(const row of group.rows){
   const label=row.label[locale] || row.label.fr;
   const note=group.note?copy.Pricing[group.note==="equipment"?"equipmentNote":group.note]:"";
   const answer=[`${label} : ${priceText(row,locale,copy.Pricing)}`,
    row.threeDays!==undefined?`${copy.Pricing.threeDays} : ${new Intl.NumberFormat(locale,{style:"currency",currency:"EUR"}).format(row.threeDays)}`:"",
    note].filter(Boolean).join("\n");
   const href=group.services[0]?`/voyageurs/${group.services[0]}#tarifs-voyageurs`:"/voyageurs#tarifs-voyageurs";
   add(`price-${group.id}-${row.id}`,label,answer,href,copy.Pricing.tariffs,`${group.title[locale] || group.title.fr} prix tarif price cost precio tarifa voyageur guest viajero`);
  }
 }
 const pinson=copy.Logements.pinson;
 const href="/logements/mini-villa-pinson";
 const property=logementsForRent.find(property=>property.slug==="mini-villa-pinson");
 const capacity=property?[copy.Logements.guestsLabel.replace("{count}",String(property.guests)),copy.Logements.bedroomsLabel.replace("{count}",String(property.bedrooms))].join(" · "):"";
 add("pinson-property","Mini Villa Pinson",[pinson.description,capacity,...pinson.highlights].join("\n"),href,copy.Logements.seeProperty,"Pinson villa logement accommodation alojamiento chambre bedroom habitacion parking plage beach playa terrasse terrace terraza");
 for(const group of pinson.amenityGroups){
  add(`pinson-${group.title}`,`Mini Villa Pinson — ${group.title}`,group.items.join(" · "),href,copy.Logements.seeProperty,`Pinson ${group.items.join(" ")}`);
 }
 add("pinson-booking",copy.Assistant.bookingQuestion,copy.Logements.booking.subtitle,href,copy.Logements.seeProperty,"Pinson reservation booking disponibilidad novembre november noviembre saison season temporada minimum nuits nights noches");
 add("pinson-payment",copy.Assistant.paymentQuestion,[copy.Logements.booking.confirmNotePay,copy.Logements.booking.paymentPending,copy.Logements.booking.paid].join("\n"),href,copy.Logements.seeProperty,"PayPal paiement payment pago livret guide");
 add("live-availability",copy.Assistant.availabilityQuestion,copy.Assistant.availabilityAnswer,href,copy.Logements.seeProperty,"disponibilite disponible libre availability available dates booked reserve dispo disponibilidad fechas libre");
 add("contact-languages",copy.ContactPresentation.languages,copy.ContactPresentation.languagesBody,"/contact",copy.ContactPresentation.infos,"francais anglais espagnol french english spanish frances ingles espanol contact telephone email whatsapp");
 add("pinson-reviews",copy.PropertyReviews.title,copy.PropertyReviews.intro,"/logements/mini-villa-pinson#avis-voyageurs",copy.PropertyReviews.sourceLink,"avis commentaire note rating review opinion Booking Airbnb Abritel");
 add("public-privacy",copy.Titles.politiqueMetaTitle,copy.Titles.politiqueMetaDesc,"/politique-confidentialite",copy.Titles.politiqueMetaTitle,"cookies rgpd donnees personnelles privacy data protection privacidad datos");
 add("public-legal",copy.Titles.mentionsMetaTitle,copy.Titles.mentionsMetaDesc,"/mentions-legales",copy.Titles.mentionsMetaTitle,"entreprise entreprise legal company empresa mentions");
 return entries;
}
