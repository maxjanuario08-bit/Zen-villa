"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { voyageursServices } from "@/lib/voyageurs-services";
import { CONTACT } from "@/lib/constants";

const FORMSPREE_URL = process.env.NEXT_PUBLIC_FORMSPREE_ID
  ? `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`
  : null;

export default function DemanderPrestationPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const prestation = String(formData.get("prestation") || "");
    const data = Object.fromEntries(formData) as Record<string, string>;

    if (!data.nom?.trim() || !data.email?.trim() || !data.telephone?.trim()) {
      return;
    }

    if (!FORMSPREE_URL) {
      const prestationLabel = prestation || "Prestation";
      const mailto = `mailto:${CONTACT.email}?subject=Demande prestation - ${encodeURIComponent(prestationLabel)}&body=${encodeURIComponent(
        `Prestation demandée: ${prestationLabel}\n\nNom: ${data.nom}\nEmail: ${data.email}\nTéléphone: ${data.telephone}\nVilla / lieu: ${data.lieu || "-"}\nDate(s) souhaitée(s): ${data.dates || "-"}\n\nMessage:\n${data.message || "-"}`
      )}`;
      window.location.href = mailto;
      setStatus("success");
      return;
    }

    formData.append("_subject", `Demande prestation - ${prestation || "Voyageur"}`);
    setStatus("loading");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative hero-bandeau flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-cote.png"
            alt="Prestations voyageurs - Corse Sud"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-lagoon-dark/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow-lg">
            Demander une prestation
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl mx-auto">
            Transport, petit-déjeuner, activités nautiques… Dites-nous ce dont vous avez besoin pour votre séjour.
          </p>
        </div>
      </section>

      {/* Contenu : formulaire + contact direct */}
      <section className="py-16 sm:py-24 bg-sand-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Formulaire */}
            <div className="lg:col-span-3">
              <Card>
                <h2 className="font-serif text-2xl font-semibold text-lagoon-dark mb-6">
                  Formulaire de demande
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="prestation" className="block text-sm font-medium text-foreground mb-1">
                      Prestation souhaitée *
                    </label>
                    <select
                      id="prestation"
                      name="prestation"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                    >
                      <option value="">Sélectionnez une prestation</option>
                      {voyageursServices.map((s) => (
                        <option key={s.slug} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-foreground mb-1">
                      Nom *
                    </label>
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder="votre@email.fr"
                    />
                  </div>
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-foreground mb-1">
                      Téléphone *
                    </label>
                    <input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label htmlFor="lieu" className="block text-sm font-medium text-foreground mb-1">
                      Villa / lieu de séjour
                    </label>
                    <input
                      id="lieu"
                      name="lieu"
                      type="text"
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder="Santa Giulia, Porto-Vecchio..."
                    />
                  </div>
                  <div>
                    <label htmlFor="dates" className="block text-sm font-medium text-foreground mb-1">
                      Date(s) souhaitée(s)
                    </label>
                    <input
                      id="dates"
                      name="dates"
                      type="text"
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
                      placeholder="Ex: 15-22 juillet"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                      Message / précisions
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none resize-none"
                      placeholder="Décrivez votre besoin..."
                    />
                  </div>
                  {status === "success" && (
                    <p className="text-sm text-green-600 font-medium">
                      Votre demande a bien été envoyée. Nous vous répondrons rapidement.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-sm text-red-600">
                      Une erreur s&apos;est produite. Utilisez l&apos;email ou le téléphone ci-contre.
                    </p>
                  )}
                  <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>
                    {status === "loading" ? "Envoi en cours..." : "Envoyer ma demande"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact direct */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                <h2 className="font-serif text-xl font-semibold text-lagoon-dark">
                  Ou contactez-nous directement
                </h2>
                <p className="text-foreground/80 text-sm">
                  Préférez un appel ou un email ? Nous sommes disponibles pour répondre à vos questions.
                </p>
                <a
                  href={`tel:${CONTACT.telephoneRaw}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-sand/50 bg-white hover:border-lagoon/40 transition-colors"
                >
                  <span className="flex-shrink-0 w-12 h-12 rounded-full bg-lagoon/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-lagoon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs text-muted">Appelez-nous</p>
                    <p className="font-semibold text-lagoon-dark">{CONTACT.telephone}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-sand/50 bg-white hover:border-lagoon/40 transition-colors"
                >
                  <span className="flex-shrink-0 w-12 h-12 rounded-full bg-lagoon/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-lagoon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs text-muted">Envoyez un email</p>
                    <p className="font-semibold text-lagoon-dark truncate">{CONTACT.email}</p>
                  </div>
                </a>
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-sand/50 bg-white hover:border-lagoon/40 transition-colors"
                >
                  <span className="flex-shrink-0 w-12 h-12 rounded-full bg-lagoon/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-lagoon" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs text-muted">WhatsApp</p>
                    <p className="font-semibold text-lagoon-dark">Nous contacter</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
