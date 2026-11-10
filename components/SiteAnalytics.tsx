"use client";

import { Analytics } from "@vercel/analytics/next";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { analyticsPublicPath, analyticsEnabled, contactEvent, trackSiteEvent } from "@/lib/analytics";
import { useEffect, useSyncExternalStore } from "react";


function subscribeAnalytics(callback:()=>void){
 window.addEventListener("zenvilla-consent",callback);window.addEventListener("storage",callback);
 return()=>{window.removeEventListener("zenvilla-consent",callback);window.removeEventListener("storage",callback);};
}
export default function SiteAnalytics() {
  const enabled = useSyncExternalStore(subscribeAnalytics,analyticsEnabled,()=>false);
  useEffect(()=>{
    const started=new WeakSet<HTMLFormElement>();
    const onClick=(event:MouseEvent)=>{
      const anchor=event.target instanceof Element?event.target.closest("a"):null;
      if(anchor){const name=contactEvent(anchor.href);if(name)trackSiteEvent(name);}
    };
    const onFocus=(event:FocusEvent)=>{
      const form=event.target instanceof Element?event.target.closest<HTMLFormElement>("form[data-analytics-form]"):null;
      const kind=form?.dataset.analyticsForm;
      if(form&&(kind==="contact"||kind==="service")&&!started.has(form)&&analyticsEnabled()){
        trackSiteEvent("lead_form_start",kind);started.add(form);
      }
    };
    document.addEventListener("click",onClick,true);document.addEventListener("focusin",onFocus);
    return()=>{document.removeEventListener("click",onClick,true);document.removeEventListener("focusin",onFocus);};
  },[]);

  return <>
    <GoogleAnalytics consent={enabled} />
    {enabled ? <Analytics beforeSend={(event) => analyticsEnabled() && analyticsPublicPath(new URL(event.url).pathname) ? { ...event, url: event.url.split(/[?#]/)[0] } : null} /> : null}
  </>;
}
