"use client";

import { useEffect, useState } from "react";
import type { readCommercialBrief } from "@/lib/admin-assistant";

type Brief = Awaited<ReturnType<typeof readCommercialBrief>>;
const endpoint = "/api/owner/admin/assistant";
const prompts = [
  ["Mes priorités", "À partir du suivi disponible, donne-moi trois actions commerciales à faire aujourd’hui."],
  ["Attirer des propriétaires", "Propose un plan sur sept jours pour attirer des propriétaires à Santa Giulia via SEO local, Instagram et Facebook, avec un appel à prendre rendez-vous."],
  ["Préparer une relance", "Rédige une relance courte et chaleureuse pour un propriétaire qui a déjà demandé à être rappelé. Prévois un champ pour le prénom et le lien de rendez-vous."],
  ["Préparer un rendez-vous", "Prépare une trame de découverte pour un rendez-vous avec un propriétaire de villa qui hésite à déléguer le ménage et les arrivées."],
];
const button = "min-h-11 rounded-xl border border-sand/60 px-3 py-2 text-sm font-medium text-lagoon-dark hover:bg-sand-light disabled:opacity-50";

export default function AdminCommercialAssistant({ onOpenCrm, onOpenInbox }: { onOpenCrm: () => void; onOpenInbox: () => void }) {
  const [brief, setBrief] = useState<Brief>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error();
        setBrief(await response.json());
      } catch {
        if (!controller.signal.aborted) setLoadFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  async function ask() {
    setBusy(true);
    setAnswer("");
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (response.ok) setAnswer(data.answer);
      else if (response.status === 429) setError("Attends quelques secondes avant de réessayer.");
      else if (response.status === 401) setError("Reconnecte-toi à l’administration.");
      else {
        const messages: Record<string, string> = {
          credentials: "OpenAI a refusé la clé API. Vérifie la clé de production dans Vercel.",
          quota: "Le projet OpenAI a atteint son quota. Vérifie ses crédits et sa limite de dépenses.",
          access: "OpenAI a refusé l’accès au modèle. Vérifie les permissions de la clé et le modèle configuré.",
          configuration: "OpenAI a refusé les paramètres de la requête. Vérifie le modèle configuré dans Vercel.",
          busy: "OpenAI a limité le nombre de requêtes. Réessaie dans un instant.",
          timeout: "OpenAI a mis trop de temps à répondre. Réessaie.",
          empty: "OpenAI n’a renvoyé aucun texte. Réessaie avec une question plus courte.",
        };
        setError(typeof data.reason === "string" && Object.hasOwn(messages, data.reason)
          ? messages[data.reason]
          : "L’assistant n’a pas pu obtenir de réponse. Réessaie dans un instant.");
      }
    } catch {
      setError("La demande a échoué. Réessaie.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-5" aria-label="Assistant commercial">
    <div>
      <h2 className="text-2xl font-semibold text-lagoon-dark">Assistant commercial</h2>
      <p className="mt-1 text-sm text-muted">Priorise les demandes, prépare tes rendez-vous et attire de nouveaux propriétaires.</p>
    </div>
    {loadFailed && <p role="alert">Le suivi commercial est temporairement indisponible.</p>}
    {!brief && !loadFailed && <p role="status">Chargement du suivi…</p>}
    {brief && <>
      <div className="grid gap-3 sm:grid-cols-3">
        {([["Demandes à traiter", brief.newInquiries, onOpenInbox],
          ["Suivis à échéance", brief.due, onOpenCrm], ["Prospects actifs", brief.active, onOpenCrm]] as const).map(([label, value, open]) =>
          <button key={label} type="button" onClick={open} className="rounded-xl border border-sand/50 bg-white p-4 text-left hover:bg-sand-light">
            <span className="block text-sm text-muted">{label}</span>
            <strong className="mt-1 block text-xl text-lagoon-dark">{value ?? "Indisponible"}</strong>
          </button>)}
      </div>
      {brief.followUps.length > 0 && <div className="rounded-xl border border-sand/50 bg-white p-4">
        <h3 className="font-semibold text-lagoon-dark">Suivis à faire en priorité</h3>
        <ul className="mt-2 divide-y divide-sand/40 text-sm">
          {brief.followUps.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-2">
            <span className="min-w-0 break-words font-medium">{item.label} · {item.due.split("-").reverse().join("/")}</span>
            <span>{item.channels.length ? item.channels.map(channel => channel === "phone" ? "Téléphone" : "Email").join(" · ") : "Autorisation de contact à vérifier"}</span>
          </li>)}
        </ul>
      </div>}
      <div className="rounded-xl border border-sand/50 bg-white p-4">
        <h3 className="font-semibold text-lagoon-dark">Actions pour attirer des propriétaires</h3>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
          <li>Publie un exemple de préparation entre deux séjours sur Instagram et Facebook. Invite les propriétaires à prendre rendez-vous depuis le site.</li>
          <li>Ajoute à la page Santa Giulia une réponse à une question que les propriétaires te posent, avec un lien vers les formules.</li>
          <li>Partage un conseil pratique dans un groupe local qui autorise les publications professionnelles, avec un lien vers le formulaire de contact.</li>
        </ul>
      </div>
      <form className="space-y-3 rounded-xl border border-sand/50 bg-white p-4 sm:p-5" onSubmit={event => { event.preventDefault(); if (!busy && question.trim()) void ask(); }}>
        <h3 className="font-semibold text-lagoon-dark">Poser une question</h3>
        {brief.aiConfigured ? <>
          <div className="flex flex-wrap gap-2">{prompts.map(([label, prompt]) =>
            <button className={button} type="button" key={label} onClick={() => setQuestion(prompt)} disabled={busy}>{label}</button>)}</div>
          <label className="block text-sm" htmlFor="commercial-question">Que veux-tu préparer ?</label>
          <textarea id="commercial-question" rows={3} maxLength={1600} value={question} onChange={event => setQuestion(event.target.value)}
            className="w-full rounded-xl border border-sand/60 p-3 text-sm" placeholder="Par exemple, que publier cette semaine pour attirer des propriétaires ?" />
          <p className="text-xs text-muted">Ta question et des indicateurs du CRM sont envoyés à OpenAI. Utilise des champs génériques pour les données personnelles.</p>
          <button type="submit" disabled={busy || !question.trim()} className="min-h-11 rounded-xl bg-lagoon px-4 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? "Réflexion en cours…" : "Demander à l’assistant"}
          </button>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {answer && <div aria-live="polite" className="whitespace-pre-wrap break-words rounded-xl bg-sand-light p-4 text-sm leading-relaxed">{answer}</div>}
        </> : <p className="text-sm text-muted">Pour activer les réponses IA, ajoute la clé OpenAI du projet dans les réglages serveur.</p>}
      </form>
    </>}
  </section>;
}
