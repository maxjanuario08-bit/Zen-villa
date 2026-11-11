"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { InboxItem, InboxStatus } from "@/lib/admin-inbox";

const root = "/api/owner/admin/pilotage";
const sections = {
  inbox: "Demandes", mail: "Emails reçus", analytics: "Analytics",
  seo: "SEO", calendar: "Rendez-vous", payments: "Paiements",
} as const;
type Section = keyof typeof sections;
const statuses: Record<InboxStatus, string> = {
  new: "À traiter", contacted: "Contacté", appointment: "Rendez-vous",
  quote: "Devis envoyé", signed: "Client", closed: "Clôturé",
};
const links = {
  mail: ["Webmail Hostinger", "https://mail.hostinger.com/"],
  analytics: ["Google Analytics", "https://analytics.google.com/"],
  seo: ["Search Console", "https://search.google.com/search-console"],
  calendar: ["Google Agenda", "https://calendar.google.com/"],
  payments: ["PayPal", "https://www.paypal.com/activity/"],
} as const;
const events: Record<string, string> = {
  generate_lead: "Formulaires envoyés", lead_form_start: "Formulaires commencés",
  contact_whatsapp: "Clics WhatsApp", contact_phone: "Clics téléphone",
  contact_email: "Clics email", appointment_click: "Clics rendez-vous",
  assistant_no_result: "Recherches sans réponse dans l’assistant",
};
const card = "min-w-0 rounded-2xl border border-sand/40 bg-white p-4";
const button = "min-h-11 rounded-xl border border-sand/60 px-3 py-2 text-sm font-medium text-lagoon-dark hover:bg-sand-light disabled:opacity-50";
const field = "min-h-11 w-full rounded-lg border border-sand/60 px-3 text-sm";
const number = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
function date(value: string, time = false) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium", ...(time ? { timeStyle: "short" as const } : {}), timeZone: "Europe/Paris",
  }).format(parsed);
}
type Metric = { label: string; value: number };
type SeoRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };
type Email = { uid: number; subject: string; from: string; date: string; unread: boolean };
type Payment = { slug: string; guest_label: string; check_in: string; check_out: string; amount: string; status: string; paid_at: string | null; created_at: string };
type Appointment = { id: string; summary: string; start: { dateTime?: string; date?: string }; htmlLink?: string };
type Inbox = { items: InboxItem[]; counts: Partial<Record<InboxStatus, number>> };
type Report =
  | Inbox
  | { data: null | { messages: Email[]; total: number } }
  | { data: null | { body?: string; missing?: boolean; tooLarge?: boolean } }
  | { data: null | { totals: number[]; events: Metric[]; sources: Metric[]; pages: Metric[] } }
  | { data: null | { period: { startDate: string; endDate: string }; total: SeoRow | null; queries: SeoRow[]; pages: SeoRow[] } }
  | { data: null | { appointments: Appointment[]; truncated: boolean } }
  | { data: Payment[] };

function External({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" className="break-words font-medium text-lagoon-dark underline underline-offset-4">{children}</a>;
}
function Stats({ items }: { items: [string, number | string][] }) {
  return <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">{items.map(([label, value]) => (
    <div className={card} key={label}><dt className="text-sm text-foreground/70">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-lagoon-dark">{typeof value === "number" ? number(value) : value}</dd></div>
  ))}</dl>;
}
function Metrics({ title, rows }: { title: string; rows: Metric[] }) {
  return <div className={card}><h3 className="mb-2 font-semibold">{title}</h3>
    {rows.length ? <dl className="divide-y divide-sand/40">{rows.map(({ label, value }) => (
      <div key={label} className="flex justify-between gap-3 py-2 text-sm">
        <dt className="min-w-0 break-words">{label}</dt><dd>{number(value)}</dd>
      </div>
    ))}</dl> : <p className="text-sm text-foreground/70">Aucune donnée sur cette période.</p>}</div>;
}

function Inquiry({ item, onSave }: { item: InboxItem; onSave: () => void }) {
  const [status, setStatus] = useState(item.status);
  const [action, setAction] = useState(item.next_action);
  const [due, setDue] = useState(item.due_date);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const { data } = item;
  async function save() {
    setSaving(true);
    setFeedback("");
    try {
      const response = await fetch(root, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status, action, due }),
      });
      if (!response.ok) throw new Error();
      onSave();
    } catch {
      setFeedback("Enregistrement impossible. Réessaie.");
    } finally {
      setSaving(false);
    }
  }

  return <details className={card}>
    <summary className="cursor-pointer break-words text-sm">
      <span className="font-semibold text-lagoon-dark">{data.nom}</span>
      {" · "}{data.prestation || (item.kind === "contact" ? "Contact" : "Prestation")}
      {" · "}{statuses[item.status]}{" · "}{date(item.created_at)}
      {item.due_date ? " · Relance " + date(item.due_date) : ""}
    </summary>
    <div className="mt-4 space-y-3 text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <a className="break-all text-lagoon-dark underline" href={`mailto:${encodeURIComponent(data.email)}`}>{data.email}</a>
        <a className="text-lagoon-dark underline" href={`tel:${data.telephone.replace(/[^+\d]/g, "")}`}>{data.telephone}</a>
      </div>
      <p>{[data.ville || data.lieu, data.type, data.dates, item.source && `Source : ${item.source}`].filter(Boolean).join(" · ")}</p>
      <p className="whitespace-pre-wrap break-words">{data.message}</p>
      <p className="text-xs text-foreground/70">{{
        accepted: "Notification acceptée par Resend", failed: "Notification email en échec", pending: "Notification en attente",
      }[item.email_status]}</p>
      <form className="grid items-end gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr_auto]" onSubmit={e => { e.preventDefault(); void save(); }}>
        <label>Statut<select className={field} value={status} onChange={e => setStatus(e.target.value as InboxStatus)}>
          {Object.entries(statuses).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </select></label>
        <label>Prochaine action<input className={field} maxLength={250} value={action} onChange={e => setAction(e.target.value)} /></label>
        <label>Date de relance<input type="date" className={field} value={due} onChange={e => setDue(e.target.value)} /></label>
        <button className={button} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
      </form>
      {feedback && <p role="alert">{feedback}</p>}
    </div>
  </details>;
}

export default function AdminPilotage({ onOpenCrm, onOpenPlanning }: { onOpenCrm: () => void; onOpenPlanning: () => void }) {
  const [section, setSection] = useState<Section>("inbox");
  const [offset, setOffset] = useState(0);
  const [email, setEmail] = useState<Email | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<{ key: string; report?: Report; error?: string }>();
  const url = section === "inbox" ? `${root}?offset=${offset}`
    : `${root}/${section}?${email ? "uid=" + email.uid : "offset=" + offset}`;
  const key = `${url}:${refresh}`;
  const state = result?.key === key ? result : undefined;
  const reload = () => setRefresh(n => n + 1);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error(response.status === 401 ? "Reconnecte-toi à l’administration." : "Données indisponibles pour le moment.");
        const report = await response.json() as Report;
        if (!controller.signal.aborted) setResult({ key, report });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ key, error: error instanceof Error && error.message === "Reconnecte-toi à l’administration."
          ? error.message : "Données indisponibles pour le moment." });
      }
    }
    void load();
    return () => controller.abort();
  }, [key, url]);

  const report = state?.report;
  const page = (next: boolean) => (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={button} disabled={offset === 0} onClick={() => setOffset(n => n - 25)}>Précédent</button>
      <button type="button" className={button} disabled={!next} onClick={() => setOffset(n => n + 25)}>Suivant</button>
    </div>
  );
  let content: ReactNode;
  if (!state) content = <p role="status">Chargement…</p>;
  else if (state.error) content = <p role="alert">{state.error}</p>;
  else if (report && "data" in report && report.data === null)
    content = <div className={card}><p className="font-semibold">Connexion à configurer</p>
      <p className="mt-1 text-sm text-foreground/70">{section === "mail"
        ? "Ajoute l’accès en lecture à la boîte Hostinger dans les réglages serveur."
        : "Configure l’accès Google en lecture pour afficher les données ici."}</p></div>;
  else if (section === "inbox") {
    const { items, counts } = report as Inbox;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    content = <>
      <Stats items={[["Demandes", total], ["À traiter", counts.new ?? 0], ["Rendez-vous", counts.appointment ?? 0], ["Clients", counts.signed ?? 0]]} />
      <p className="text-sm text-foreground/70">Formulaires du site. Ouvre une demande pour préparer la suite ou planifier une relance.</p>
      {items.map(item => <Inquiry key={item.id} item={item} onSave={reload} />)}
      {!items.length && <p>Aucune demande sur cette page.</p>}
      {(offset > 0 || total > 25) && page(offset + 25 < total)}
    </>;
  } else if (section === "mail") {
    if (email) {
      const { data } = report as { data: { body?: string; missing?: boolean; tooLarge?: boolean } };
      content = <div className={card}>
        <button type="button" className={button} onClick={() => setEmail(null)}>Retour aux emails</button>
        <h3 className="mt-3 break-words font-semibold">{email.subject}</h3>
        <p className="break-all text-sm">{email.from} · {date(email.date, true)}</p>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm">{data.missing ? "Ce message est introuvable." : data.tooLarge
          ? "Ouvre le webmail pour lire ce message volumineux." : data.body || "Aucun texte à afficher."}</p>
      </div>;
    } else {
      const { data } = report as { data: { messages: Email[]; total: number } };
      content = <><p className="text-sm text-foreground/70">Boîte de réception en lecture seule. Pièces jointes et réponses dans le webmail.</p>
        <ul className={card}>{data.messages.map(message => <li key={message.uid} className="border-b border-sand/40 last:border-0">
          <button type="button" className="flex min-h-11 w-full flex-wrap items-baseline justify-between gap-x-4 p-2 text-left text-sm hover:bg-sand-light" onClick={() => setEmail(message)}>
            <span className={`min-w-0 break-all ${message.unread ? "font-semibold" : ""}`}>{message.subject} · {message.from}</span>
            <span className="text-foreground/70">{date(message.date)}</span>
          </button>
        </li>)}{!data.messages.length && <li>Aucun email sur cette page.</li>}</ul>
        {(offset > 0 || data.total > 25) && page(offset + 25 < data.total)}</>;
    }
  } else if (section === "analytics") {
    const { data } = report as { data: { totals: number[]; events: Metric[]; sources: Metric[]; pages: Metric[] } };
    content = <><p className="text-sm text-foreground/70">28 derniers jours complets. Les clics rendez-vous et WhatsApp mesurent une intention.</p>
      <Stats items={[["Utilisateurs actifs", data.totals[0] ?? 0], ["Sessions", data.totals[1] ?? 0], ["Pages vues", data.totals[2] ?? 0]]} />
      <div className="grid gap-3 lg:grid-cols-3">
        <Metrics title="Actions sur le site" rows={Object.entries(events).map(([key, label]) => ({ label, value: data.events.find(row => row.label === key)?.value ?? 0 }))} />
        <Metrics title="Sources · sessions" rows={data.sources} /><Metrics title="Pages · vues" rows={data.pages} />
      </div></>;
  } else if (section === "seo") {
    const { data } = report as { data: { period: { startDate: string; endDate: string }; total: SeoRow | null; queries: SeoRow[]; pages: SeoRow[] } };
    content = <><p className="text-sm text-foreground/70">Recherche Google du {date(data.period.startDate)} au {date(data.period.endDate)}.</p>
      <Stats items={[["Clics", data.total?.clicks ?? 0], ["Impressions", data.total?.impressions ?? 0],
        ["Taux de clic", data.total ? number(data.total.ctr * 100) + " %" : "—"],
        ["Position moyenne", data.total ? number(Math.round(data.total.position * 10) / 10) : "—"]]} />
      <div className="grid gap-3 lg:grid-cols-2">
        <Metrics title="Requêtes · clics" rows={data.queries.map(row => ({ label: row.keys?.[0] ?? "—", value: row.clicks }))} />
        <Metrics title="Pages · clics" rows={data.pages.map(row => ({ label: row.keys?.[0] ?? "—", value: row.clicks }))} />
      </div></>;
  } else if (section === "calendar") {
    const { data } = report as { data: { appointments: Appointment[]; truncated: boolean } };
    content = <><p className="text-sm text-foreground/70">Créneaux confirmés sur l’agenda configuré pour les 90 prochains jours.</p>
      <ul className={card}>{data.appointments.map(event => <li key={event.id} className="break-words border-b border-sand/40 py-2 last:border-0">
        {date(event.start.dateTime ?? event.start.date ?? "", Boolean(event.start.dateTime))} · {event.summary}
      </li>)}{!data.appointments.length && <li>Aucun rendez-vous trouvé.</li>}</ul>
      {data.truncated && <p>Liste partielle. Voir tous les rendez-vous dans Google Agenda.</p>}</>;
  } else {
    const { data } = report as { data: Payment[] };
    content = <><p className="text-sm text-foreground/70">25 dernières demandes de paiement enregistrées par le site. Frais et remboursements dans PayPal.</p>
      <ul className={card}>{data.map((payment, index) => <li key={payment.created_at + index} className="break-words border-b border-sand/40 py-3 text-sm last:border-0">
        <strong>{payment.guest_label || "Voyageur"}</strong> · {payment.slug} · {date(payment.check_in)} → {date(payment.check_out)} · {number(Number(payment.amount))} €
        {" · "}{payment.paid_at || payment.status === "paid" ? "Payé" : ({ pending: "En attente", canceled: "Annulé", expired: "Expiré" }[payment.status] ?? payment.status)}
      </li>)}{!data.length && <li>Aucun paiement enregistré.</li>}</ul></>;
  }

  return <section aria-label="Pilotage" className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-2xl font-semibold text-lagoon-dark">Pilotage</h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={onOpenCrm}>CRM</button>
        <button type="button" className={button} onClick={onOpenPlanning}>Planning</button>
        <External href="https://business.facebook.com/">Meta Business Suite</External>
      </div>
    </div>
    <nav aria-label="Rubriques du pilotage" className="flex flex-wrap gap-2">
      {Object.entries(sections).map(([id, label]) => <button key={id} type="button" aria-pressed={section === id}
        className={`${button} ${section === id ? "bg-sand-light ring-1 ring-lagoon/40" : "bg-white"}`}
        onClick={() => { setSection(id as Section); setOffset(0); setEmail(null); }}>{label}</button>)}
    </nav>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold">{sections[section]}</h3>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {section !== "inbox" && <External href={links[section][1]}>{links[section][0]} ↗</External>}
        <button type="button" className={button} onClick={reload}>Actualiser</button>
      </div>
    </div>
    <div className="space-y-3">{content}</div>
  </section>;
}
