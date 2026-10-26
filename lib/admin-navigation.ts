"use client";
import { useEffect } from "react";
export function canLeaveAdminSection(){return window.dispatchEvent(new Event('zenvilla-admin-navigation',{cancelable:true}));}
export function useUnsavedAdminGuard(dirty:boolean){
 useEffect(()=>{
  if(!dirty)return;
  const check=(e:Event)=>{if(!window.confirm('Des modifications ne sont pas enregistrées. Quitter sans enregistrer ?'))e.preventDefault();};
  const click=(e:MouseEvent)=>{const anchor=(e.target as Element)?.closest?.('a[href]') as HTMLAnchorElement|null;if(anchor&&anchor.href&&!anchor.href.startsWith('javascript:')&&anchor.target!=='_blank'){check(e);if(e.defaultPrevented)e.stopPropagation();}};
  window.addEventListener('zenvilla-admin-navigation',check);document.addEventListener('click',click,true);
  return()=>{window.removeEventListener('zenvilla-admin-navigation',check);document.removeEventListener('click',click,true);};
 },[dirty]);
}
