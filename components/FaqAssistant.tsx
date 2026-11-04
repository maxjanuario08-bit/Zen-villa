"use client";
import {useEffect,useRef,useState} from "react";
import {useLocale,useTranslations} from "next-intl";
import {MessageCircle,X,Search,CalendarDays,Mail,Phone,ArrowRight} from "lucide-react";
import {Link,usePathname} from "@/i18n/navigation";
import {CONTACT} from "@/lib/constants";
import {analyticsPublicPath} from "@/lib/analytics";
import {searchFaq} from "@/lib/assistant-search";
import faq from "@/data/assistant-faq.json";

export default function FaqAssistant(){
 const t=useTranslations("Assistant"); const locale=useLocale();const pathname=usePathname();
 const [open,setOpen]=useState(false);const [query,setQuery]=useState("");
 const dialog=useRef<HTMLDialogElement>(null);const launcher=useRef<HTMLButtonElement>(null);
 const allowed=analyticsPublicPath(pathname)&&!/^\/livret(?:\/|$)/.test(pathname);
 const entries=faq[locale as keyof typeof faq]||faq.fr;
 const results=searchFaq(entries,query);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&allowed){if(!el.open)el.showModal();}else if(el.open)el.close();},[open,allowed]);
 useEffect(()=>{if(!open||!allowed)return;const before=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=before;};},[open,allowed]);
 function close(){setOpen(false);setQuery("");launcher.current?.focus();}
 if(!allowed)return null;
 return <>
  <button ref={launcher} type="button" onClick={()=>setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-controls="zenvilla-assistant" className="fixed bottom-5 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-lagoon-dark px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-lagoon focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lagoon sm:right-6"><MessageCircle size={20} aria-hidden="true"/>{t("launcher")}</button>
  <dialog ref={dialog} id="zenvilla-assistant" aria-labelledby="assistant-title" onKeyDownCapture={event=>{if(event.key==="Escape"){event.preventDefault();close();}}} onCancel={close} onClose={()=>setOpen(false)} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-hidden rounded-2xl border border-sand bg-white p-0 text-foreground shadow-xl backdrop:bg-black/30">
   <div className="flex max-h-[85dvh] flex-col">
    <header className="flex shrink-0 items-start justify-between gap-3 bg-lagoon-dark p-5 text-white"><div><h2 id="assistant-title" className="font-serif text-2xl font-semibold">{t("title")}</h2><p className="mt-1 text-sm text-white/85">{t("subtitle")}</p></div><button type="button" onClick={close} aria-label={t("close")} className="rounded-full p-2 hover:bg-white/15"><X size={20} aria-hidden="true"/></button></header>
    <div className="overflow-y-auto overscroll-contain p-5">
     <div className="grid grid-cols-2 gap-2"><Link href="/contact#rendez-vous" onClick={close} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-lagoon px-3 py-3 text-sm font-semibold text-white"><CalendarDays size={17} aria-hidden="true"/>{t("appointment")}</Link><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-sand p-3 text-center text-sm font-medium text-lagoon-dark">{t("whatsapp")}</a><Link href="/contact#formulaire" onClick={close} className="flex items-center justify-center gap-2 rounded-xl border border-sand p-3 text-sm font-medium text-lagoon-dark"><Mail size={16} aria-hidden="true"/>{t("message")}</Link></div>
     <label htmlFor="assistant-search" className="mb-2 mt-6 block text-sm font-semibold">{t("searchLabel")}</label><div className="relative"><Search className="absolute left-3 top-3 text-muted" size={18} aria-hidden="true"/><input id="assistant-search" type="search" value={query} maxLength={200} onChange={e=>setQuery(e.target.value)} placeholder={t("placeholder")} className="w-full rounded-xl border border-sand py-2.5 pl-10 pr-3 text-base outline-none focus:border-lagoon focus:ring-1 focus:ring-lagoon"/></div>
     <p className="mt-2 text-xs text-muted">{t("privacy")}</p>
     <p role="status" className="mt-4 text-xs text-muted">{t("results",{count:results.length})}</p>
     <div className="mt-2 space-y-2">{results.map(entry=><details key={`${locale}-${entry.id}`} className="rounded-xl border border-sand/70 p-3"><summary className="cursor-pointer text-sm font-semibold text-lagoon-dark">{entry.question}</summary><p className="mt-3 text-sm leading-relaxed text-foreground/85">{entry.answer}</p><Link href={entry.href} onClick={close} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-lagoon underline underline-offset-4">{entry.linkLabel}<ArrowRight size={14} aria-hidden="true"/></Link></details>)}</div>
     {results.length===0?<p className="mt-3 rounded-xl bg-sand-light p-4 text-sm">{t("noResults")}</p>:null}
     <footer className="mt-5 border-t border-sand pt-4"><p className="text-sm font-medium">{t("human")}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-lagoon"><a href={`tel:${CONTACT.telephoneTel}`} className="inline-flex items-center gap-1"><Phone size={14} aria-hidden="true"/>{CONTACT.telephone}</a><a href={`mailto:${CONTACT.email}`} className="break-all underline underline-offset-4">{CONTACT.email}</a></div></footer>
    </div>
   </div>
  </dialog>
 </>;
}
