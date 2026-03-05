"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import { CONTACT } from "@/lib/constants";

const faqItems = [
  {
    question: "Comment fonctionne la conciergerie Zenvilla ?",
    reponse:
      "Zenvilla prend en charge l'intégralité de la gestion de votre villa : accueil des voyageurs, ménage, maintenance, et éventuellement la mise en ligne sur les plateformes de location. Vous suivez tout en temps réel via notre application digitale.",
  },
  {
    question: "Quelles zones couvre Zenvilla en Corse Sud ?",
    reponse:
      "Nous intervenons sur l'ensemble du Corse Sud : Bonifacio, Porto-Vecchio, Propriano, Sartène, et les alentours. N'hésitez pas à nous contacter pour vérifier la couverture de votre zone.",
  },
  {
    question: "Comment est calculée la tarification ?",
    reponse:
      "Nous proposons 3 formules : le Pack Zen Tranquillité (tarif saison forfaitaire), le Pack Zen Premium (commission sur le CA locatif), et le Pack Zen Flex (à la prestation). Chaque pack est détaillé sur notre page Packs.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {faqItems.map((item, index) => (
        <div
          key={index}
          className="border border-sand/50 rounded-2xl overflow-hidden bg-white"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-6 py-4 text-left font-medium text-lagoon-dark hover:bg-sand-light/50 transition-colors"
          >
            {item.question}
            <svg
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4 pt-0 text-foreground/80 text-sm leading-relaxed">
              {item.reponse}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: Record<string, string>) => {
    const err: Record<string, string> = {};
    if (!data.nom?.trim()) err.nom = "Le nom est requis";
    if (!data.email?.trim()) err.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      err.email = "Email invalide";
    if (!data.telephone?.trim()) err.telephone = "Le téléphone est requis";
    if (!data.message?.trim()) err.message = "Le message est requis";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as Record<string, string>;

    if (!validate(data)) return;

    try {
      setStatus("success");
      const mailto = `mailto:${CONTACT.email}?subject=Demande de contact - ${encodeURIComponent(
        data.nom
      )}&body=${encodeURIComponent(
        `Nom: ${data.nom}\nEmail: ${data.email}\nTéléphone: ${data.telephone}\nVille/zone: ${data.ville}\nType de bien: ${data.type}\n\nMessage:\n${data.message}`
      )}`;
      window.location.href = mailto;
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-sand-light to-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-lagoon-dark">
            Contact
          </h1>
          <p className="mt-6 text-lg text-foreground/80 max-w-2xl mx-auto">
            Une question, un projet ? Notre équipe vous répond rapidement.
          </p>
          <p className="mt-2 text-sm text-lagoon font-medium">
            Réponse rapide – 7j/7
          </p>

          {/* Coordonnées */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10">
            <a
              href={`tel:${CONTACT.telephoneRaw}`}
              className="inline-flex items-center gap-2 text-foreground hover:text-lagoon transition-colors"
            >
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium">{CONTACT.telephone}</span>
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex items-center gap-2 text-foreground hover:text-lagoon transition-colors"
            >
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{CONTACT.email}</span>
            </a>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:text-lagoon transition-colors"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="font-medium">Instagram</span>
            </a>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:text-lagoon transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="font-medium">WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Formulaire + FAQ */}
      <section className="py-12 sm:py-20 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Formulaire */}
            <div className="lg:col-span-3">
              <Card>
                <h2 className="font-serif text-2xl font-semibold text-lagoon-dark mb-6">
                  Demander un devis
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="nom"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Nom *
                    </label>
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors"
                      placeholder="Votre nom"
                    />
                    {errors.nom && (
                      <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors"
                      placeholder="votre@email.fr"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="telephone"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Téléphone *
                    </label>
                    <input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      required
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors"
                      placeholder="06 12 34 56 78"
                    />
                    {errors.telephone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.telephone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="ville"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Ville / zone en Corse
                    </label>
                    <input
                      id="ville"
                      name="ville"
                      type="text"
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors"
                      placeholder="Bonifacio, Porto-Vecchio..."
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Type de bien
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="Villa">Villa</option>
                      <option value="Appartement">Appartement</option>
                      <option value="Maison">Maison</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      className="w-full rounded-xl border border-sand/60 px-4 py-2.5 text-foreground focus:border-lagoon focus:ring-1 focus:ring-lagoon outline-none transition-colors resize-none"
                      placeholder="Décrivez votre projet ou votre demande..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>
                  {status === "success" && (
                    <p className="text-sm text-green-600 font-medium">
                      Votre messagerie va s&apos;ouvrir avec les détails de votre demande. Merci de l&apos;envoyer pour finaliser.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-sm text-red-600">
                      Une erreur s'est produite. Veuillez réessayer.
                    </p>
                  )}
                  <Button type="submit" variant="primary" className="w-full">
                    Envoyer ma demande
                  </Button>
                </form>
              </Card>
            </div>

            {/* FAQ */}
            <div className="lg:col-span-2">
              <h2
                id="faq"
                className="font-serif text-2xl font-semibold text-lagoon-dark mb-6"
              >
                FAQ
              </h2>
              <FAQSection />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
