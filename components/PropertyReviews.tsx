"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ExternalLink, MessageSquareQuote, Quote } from "lucide-react";
import { sortedPropertyReviews, type PropertyReview, type PropertyReviewsData, type ReviewPlatform, type ReviewPlatformId, type ReviewTranslations, type ReviewText } from "@/lib/property-reviews";

function ReviewCard({review, platform, translated}: {review: PropertyReview; platform: ReviewPlatform; translated?: ReviewText}) {
  const t = useTranslations("PropertyReviews");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [showProvided, setShowProvided] = useState(false);
  const hasTranslation = review.language !== locale && Boolean(translated);
  const content = hasTranslation && !showProvided ? translated! : review;
  const contentLanguage = hasTranslation && !showProvided ? locale : review.language;
  const country = review.countryCode ? new Intl.DisplayNames([locale], {type: "region"}).of(review.countryCode) : null;
  const long = content.text.length + content.negative.length > 280;
  const old = review.archived || Boolean(review.date && review.date.slice(0,4) < "2026");
  const date = review.date ? new Intl.DateTimeFormat(locale, {
    month:"long",year:"numeric",...(review.date.length > 7 ? {day:"numeric"} as const : {}),timeZone:"UTC",
  }).format(new Date(`${review.date.length === 7 ? `${review.date}-01` : review.date}T12:00:00Z`)) : null;
  return <article className="flex h-full flex-col rounded-2xl border border-sand/60 bg-white p-5 shadow-card sm:p-6">
    <header className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-light font-serif text-xl font-semibold text-lagoon-dark">{review.author?.slice(0,1).toUpperCase() || <MessageSquareQuote size={18}/>}</span>
        <div className="min-w-0"><p className="font-semibold text-lagoon-dark">{review.author || t("anonymous")}</p><p className="text-xs text-muted">{date ? t(review.dateKind === "published" ? "published" : "stayed", {date}) : t("dateUnknown")}</p></div>
      </div>
      <span className="shrink-0 rounded-xl bg-lagoon-dark px-2.5 py-1.5 text-sm font-semibold text-white" aria-label={t("rated",{score:review.rating,scale:platform.scale})}>{new Intl.NumberFormat(locale).format(review.rating)}<span className="ml-0.5 text-xs font-normal text-white/75">/{platform.scale}</span></span>
    </header>
    {country ? <p className="mt-3 text-xs text-muted">{t("country", {country})}</p> : null}
    <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
      <span className="rounded-full border border-sand/70 px-2.5 py-1 text-foreground/70">{platform.name}</span>
      {old ? <span className="rounded-full bg-sand-light px-2.5 py-1 text-foreground/70">{t(review.archived ? "archived" : "older")}</span> : null}
      {hasTranslation && !showProvided ? <span className="rounded-full bg-lagoon/10 px-2.5 py-1 text-lagoon-dark">{t("translated")}</span> : null}
      {review.platformTranslated ? <span className="rounded-full bg-sand-light px-2.5 py-1 text-foreground/70">{t("platformTranslation",{platform:platform.name})}</span> : null}
    </div>
    <blockquote id={`${review.id}-comment`} className="mt-4 grow break-words text-sm leading-relaxed text-foreground/85" lang={contentLanguage}>
      {content.title ? <p className="mb-2 font-serif text-lg font-semibold leading-snug text-lagoon-dark">{content.title}</p> : null}
      {content.text ? <p className={`whitespace-pre-line ${!expanded && long ? "line-clamp-4" : ""}`}>{content.text}</p> : <p className="italic text-muted" lang={locale}>{t("noComment")}</p>}
      {content.negative ? <div className="mt-3 border-l-2 border-sand pl-3"><p className="mb-1 text-xs font-semibold text-muted" lang={locale}>{t("alsoMentioned")}</p><p className={`whitespace-pre-line ${!expanded && long ? "line-clamp-2" : ""}`}>{content.negative}</p></div> : null}
    </blockquote>
    {hasTranslation ? <button type="button" className="mt-4 self-start rounded-lg py-1 text-xs font-medium text-lagoon underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lagoon" aria-pressed={showProvided} onClick={()=>setShowProvided(value=>!value)}>{t(showProvided ? "showTranslation" : "showProvided")}</button> : null}
    {long ? <button type="button" className="mt-4 self-start rounded-lg py-1 text-sm font-semibold text-lagoon underline decoration-lagoon/30 underline-offset-4 hover:text-lagoon-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lagoon" aria-expanded={expanded} aria-controls={`${review.id}-comment`} onClick={()=>setExpanded(!expanded)}>{t(expanded ? "less" : "more")}</button> : null}
  </article>;
}

export default function PropertyReviews({data, translations}: {data: PropertyReviewsData; translations: ReviewTranslations}) {
  const t = useTranslations("PropertyReviews");
  const locale = useLocale();
  const [filter, setFilter] = useState<ReviewPlatformId | "all">("all");
  const [limit, setLimit] = useState(6);
  const filtered = sortedPropertyReviews(data.reviews, data.platforms).filter(review=>filter === "all" || review.platform === filter);
  const platforms = Object.fromEntries(data.platforms.map(platform=>[platform.id,platform]));
  const number = new Intl.NumberFormat(locale,{minimumFractionDigits:1,maximumFractionDigits:1});
  function select(value: ReviewPlatformId | "all") {setFilter(value);setLimit(6);}
  return <section id="avis-voyageurs" aria-labelledby="property-reviews-title" className="scroll-mt-24 border-t border-sand/50 bg-background py-12 sm:py-20">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lagoon"><Quote size={16} aria-hidden="true"/>{t("eyebrow")}</p><h2 id="property-reviews-title" className="mt-3 font-serif text-3xl font-semibold leading-tight text-lagoon-dark sm:text-4xl">{t("title")}</h2><p className="mt-4 text-base leading-relaxed text-muted">{t("intro")}</p></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {data.platforms.map(platform=><div key={platform.id} className="rounded-2xl border border-sand/70 bg-sand-light/70 p-5 sm:p-6"><p className="text-sm font-semibold text-lagoon-dark">{platform.name}</p><p className="mt-2 font-serif text-4xl font-semibold text-lagoon-dark">{number.format(platform.rating)}<span className="ml-1 font-sans text-base font-normal text-muted">/ {platform.scale}</span></p><p className="mt-1 text-sm text-muted">{t("platformCount",{count:platform.count})}</p>{platform.url ? <a href={platform.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-lagoon underline underline-offset-4">{t("sourceLink")}<ExternalLink size={13} aria-hidden="true"/></a> : null}</div>)}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">{t("ratingsNote")}</p>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={t("filterLabel")}>
        <button type="button" aria-pressed={filter === "all"} onClick={()=>select("all")} className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${filter === "all" ? "border-lagoon bg-lagoon text-white" : "border-sand/70 bg-white text-lagoon-dark hover:border-lagoon"}`}>{t("all")} <span className="ml-1 opacity-70">({data.reviews.length})</span></button>
        {data.platforms.map(platform=><button type="button" key={platform.id} aria-pressed={filter === platform.id} onClick={()=>select(platform.id)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${filter === platform.id ? "border-lagoon bg-lagoon text-white" : "border-sand/70 bg-white text-lagoon-dark hover:border-lagoon"}`}>{platform.name} <span className="ml-1 opacity-70">({data.reviews.filter(review=>review.platform === platform.id).length})</span></button>)}
      </div>
      <p className="mt-4 text-xs text-muted">{t("sortNote")}</p>
      <p role="status" aria-live="polite" className="mt-4 text-sm text-muted">{t("displayed",{count:Math.min(limit,filtered.length),total:filtered.length})}</p>
      <div className="mt-5 grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.slice(0,limit).map(review=><ReviewCard key={`${locale}-${review.id}`} review={review} platform={platforms[review.platform]} translated={translations[review.id]}/>)}</div>
      <div className="mt-7 flex flex-wrap justify-center gap-3">{limit < filtered.length ? <button type="button" onClick={()=>setLimit(limit+6)} className="inline-flex items-center gap-2 rounded-full bg-lagoon px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-lagoon-dark">{t("showMore")}<ArrowDown size={16} aria-hidden="true"/></button> : null}{limit > 6 ? <a href="#avis-voyageurs" onClick={()=>setLimit(6)} className="inline-flex items-center gap-2 rounded-full border border-sand px-6 py-3 text-sm font-semibold text-lagoon-dark hover:bg-sand-light">{t("showFewer")}<ArrowUp size={16} aria-hidden="true"/></a> : null}</div>
      <div className="mt-8 rounded-2xl border border-sand/60 bg-sand-light/50 p-5 text-xs leading-relaxed text-muted"><p>{t("context")}</p><p className="mt-2">{t("languages")}</p></div>
    </div>
  </section>;
}
