import { listInquiries } from "@/lib/admin-inbox";
import { contactAllowed } from "@/lib/prospect-model";
import { listProspects, prospectTasks } from "@/lib/prospect-store";

export async function readCommercialBrief() {
  const [crm, tasks, inbox] = await Promise.allSettled([listProspects(), prospectTasks(), listInquiries()]);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date());
  const prospects = crm.status === "fulfilled" ? crm.value.filter(
    lead => !lead.suppressed && !["won", "lost", "opted-out"].includes(lead.status),
  ) : [];
  const pendingTasks = tasks.status === "fulfilled" ? tasks.value.filter(task => !task.done && task.due && task.due <= today) : [];
  const dueByProspect = new Map<string, string>();
  for (const task of pendingTasks) {
    const current = dueByProspect.get(task.prospectId);
    if (!current || task.due < current) dueByProspect.set(task.prospectId, task.due);
  }
  const followUps = prospects.flatMap(lead => {
    const due = [lead.nextFollowUp, dueByProspect.get(lead.id)].filter((value): value is string => Boolean(value)).sort()[0];
    if (!due || due > today) return [];
    const channels = (["email", "phone"] as const).filter(channel => contactAllowed(lead, channel));
    return [{ id: lead.id, label: lead.property || lead.name, zone: lead.zone, status: lead.status, due, channels }];
  }).sort((a, b) => a.due.localeCompare(b.due));
  const counts = inbox.status === "fulfilled" ? inbox.value.counts : null;
  return {
    active: crm.status === "fulfilled" ? prospects.length : null,
    due: crm.status === "fulfilled" && tasks.status === "fulfilled" ? followUps.length : null,
    newInquiries: counts ? counts.new ?? 0 : null,
    followUps: followUps.slice(0, 8),
    aiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
  };
}

const instructions = `Tu es l’assistant commercial interne de Zen Villa, conciergerie de locations saisonnières à Santa Giulia et Porto-Vecchio. Objectif : signer 2 à 3 villas. Réponds en français, avec des actions courtes et concrètes. Distingue les faits du CRM des recommandations et signale les données manquantes.
Aide à prioriser les demandes entrantes, préparer des brouillons génériques avec champs à compléter, organiser les relances et attirer des propriétaires via SEO local, Instagram, Facebook, publications autorisées dans les groupes et rendez-vous depuis le site. Les zones prioritaires sont Santa Giulia, Palombaggia, Bocca dell’Oro et Piccovaggia, Porto-Vecchio, puis Cala Rossa, Lecci et Saint-Cyprien. Les prospects privés doivent avoir donné leur accord avant d’être contactés. Une action de suivi n’implique pas une autorisation de contact. Si l’autorisation n’est pas établie, propose une vérification interne ou une action d’acquisition publique. N’invente ni coordonnées, ni résultats, ni contacts, ni données Analytics. Ne prétends pas consulter Internet, lire les emails ou agir à la place de l’administrateur. Termine par une prochaine action concrète. Utilise du texte simple avec des listes courtes, sans tableaux.`;

export async function askCommercialAssistant(question: string, key: string) {
  const brief = await readCommercialBrief();
  const snapshot = {
    activeProspects: brief.active,
    dueFollowUps: brief.due,
    newInquiries: brief.newInquiries,
    sampleOfDueFollowUps: brief.followUps.map(({ zone, status, due, channels }) => ({ zone, status, due, channels })),
  };
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: process.env.ZENVILLA_OPENAI_MODEL || "gpt-5-mini",
      instructions,
      input: JSON.stringify({ question, snapshot }),
      reasoning: { effort: "minimal" },
      max_output_tokens: 1200,
      store: false,
    }),
  });
  if (!response.ok) throw new Error("OpenAI " + response.status);
  const data = await response.json() as {
    output?: { type: string; content?: { type: string; text?: string }[] }[];
  };
  const answer = data.output?.filter(item => item.type === "message")
    .flatMap(item => item.content ?? []).filter(item => item.type === "output_text")
    .map(item => item.text ?? "").join("\n").trim();
  if (!answer) throw new Error("OpenAI response empty");
  return answer;
}
