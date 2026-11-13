"use client";

import { useRef, useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { inquirySource, trackSiteEvent } from "@/lib/analytics";

export default function OwnerLeadForm({ copy }: {
  copy: { name: string; email: string; address: string; consent: string; privacy: string; submit: string; sending: string; success: string; error: string };
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const pending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    pending.current = true;
    setStatus("sending");
    try {
      const response = await fetch("/api/site-mail/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "owner",
          nom: data.get("nom"),
          email: data.get("email"),
          propertyAddress: data.get("propertyAddress"),
          contactConsent: data.get("contactConsent") === "on",
          source: inquirySource(),
        }),
      });
      if (!response.ok) throw new Error("Contact request failed");
      trackSiteEvent("generate_lead", "contact");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      pending.current = false;
    }
  }

  const field = "mt-1 w-full rounded-xl border border-sand-dark/40 bg-white px-3 py-2.5";

  return (
    <form method="post" data-analytics-form="contact" onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">{copy.name}
          <input className={field} name="nom" autoComplete="name" required maxLength={80} />
        </label>
        <label className="text-sm font-medium">{copy.email}
          <input className={field} name="email" type="email" autoComplete="email" required maxLength={120} />
        </label>
      </div>
      <label className="block text-sm font-medium">{copy.address}
        <input className={field} name="propertyAddress" required maxLength={250} />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input className="mt-1" name="contactConsent" type="checkbox" required />
        <span>{copy.consent}</span>
      </label>
      <Link href="/politique-confidentialite" className="block text-xs text-lagoon-dark underline">{copy.privacy}</Link>
      <button type="submit" disabled={status === "sending"} className="min-h-11 rounded-full bg-lagoon px-5 text-sm font-semibold text-white hover:bg-lagoon-dark disabled:opacity-60">
        {status === "sending" ? copy.sending : copy.submit}
      </button>
      {status === "success" && <p role="status" className="text-sm text-lagoon-dark">{copy.success}</p>}
      {status === "error" && <p role="alert" className="text-sm text-red-700">{copy.error}</p>}
    </form>
  );
}
