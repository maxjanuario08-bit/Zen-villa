"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { CONTACT } from "@/lib/constants";

const FORMSPREE_URL = process.env.NEXT_PUBLIC_FORMSPREE_ID
  ? `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`
  : null;

export default function EstimerRevenusForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!FORMSPREE_URL) {
      const data = Object.fromEntries(formData) as Record<string, string>;
      const mailto = `mailto:${CONTACT.email}?subject=Estimation revenus villa - ${encodeURIComponent(data.nom)}&body=${encodeURIComponent(
        `Nom: ${data.nom}\nEmail: ${data.email}\nTéléphone: ${data.telephone}\nLocalisation villa: ${data.localisation || "-"}\nNombre de chambres: ${data.chambres || "-"}\n\nDemande: Estimation des revenus locatifs`
      )}`;
      window.location.href = mailto;
      setStatus("success");
      return;
    }

    formData.append("_subject", "Estimation revenus villa - Zenvilla");
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
    <Card>
      <h3 className="font-serif text-xl font-semibold text-lagoon-dark mb-6">
        Estimer mes revenus
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label htmlFor="localisation" className="block text-sm font-medium text-foreground mb-1">
            Localisation de la villa
          </label>
          <input
            id="localisation"
            name="localisation"
            type="text"
            className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
            placeholder="Santa Giulia, Porto-Vecchio, Palombaggia..."
          />
        </div>
        <div>
          <label htmlFor="chambres" className="block text-sm font-medium text-foreground mb-1">
            Nombre de chambres
          </label>
          <select
            id="chambres"
            name="chambres"
            className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none"
          >
            <option value="">Sélectionnez</option>
            <option value="1-2">1 à 2 chambres</option>
            <option value="3">3 chambres</option>
            <option value="4">4 chambres</option>
            <option value="5+">5 chambres ou plus</option>
          </select>
        </div>
        {status === "success" && (
          <p className="text-sm text-green-600 font-medium">
            Merci ! Nous vous contacterons rapidement pour estimer vos revenus.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">
            Une erreur s'est produite. Veuillez réessayer ou nous appeler au {CONTACT.telephone}.
          </p>
        )}
        <Button type="submit" variant="primary" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Envoi en cours..." : "Estimer mes revenus"}
        </Button>
      </form>
    </Card>
  );
}
