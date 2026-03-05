import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, COMPANY, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales et informations juridiques du site Zenvilla – Conciergerie Corse Sud.",
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <div>
      <section className="py-16 sm:py-24 bg-gradient-to-b from-sand-light to-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-lagoon-dark">
            Mentions légales
          </h1>
          <p className="mt-4 text-foreground/80">
            Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12 text-foreground/90 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-lagoon-dark mb-4">1. Éditeur du site</h2>
            <p>
              Le site <strong>{SITE.url}</strong> est édité par <strong>{COMPANY.name}</strong>.
            </p>
            <p className="mt-4">
              <strong>Adresse du siège :</strong><br />
              {COMPANY.address}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-lagoon-dark mb-4">2. Directeur de la publication</h2>
            <p>
              Le directeur de la publication est <strong>{COMPANY.director}</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-lagoon-dark mb-4">3. Hébergement</h2>
            <p>
              Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
            </p>
            <p className="mt-2">
              Site de l'hébergeur :{" "}
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-lagoon hover:underline">
                vercel.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-lagoon-dark mb-4">4. Contact</h2>
            <p>Pour toute question, vous pouvez nous contacter :</p>
            <ul className="mt-4 space-y-2">
              <li>
                <strong>Email :</strong>{" "}
                <a href={`mailto:${CONTACT.email}`} className="text-lagoon hover:underline">
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <strong>Téléphone :</strong>{" "}
                <a href={`tel:${CONTACT.telephoneRaw}`} className="text-lagoon hover:underline">
                  {CONTACT.telephone}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-lagoon-dark mb-4">5. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, logos, structure, design) est protégé par le droit d'auteur et le droit des marques. Toute reproduction, représentation ou exploitation non autorisée constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-lagoon-dark mb-4">6. Données personnelles (RGPD)</h2>
            <p>
              Pour les informations détaillées sur la collecte, l'utilisation et la protection de vos données personnelles, consultez notre{" "}
              <Link href="/politique-confidentialite" className="text-lagoon hover:underline">
                Politique de confidentialité
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-lagoon-dark mb-4">7. Cookies</h2>
            <p>
              Pour toutes les informations relatives aux cookies utilisés sur ce site, consultez notre{" "}
              <Link href="/politique-confidentialite#cookies" className="text-lagoon hover:underline">
                Politique de confidentialité – section Cookies
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-lagoon-dark mb-4">8. Liens hypertextes</h2>
            <p>
              Les liens vers des sites externes ne sauraient engager la responsabilité de Zenvilla quant au contenu de ces sites. La création de liens vers ce site est autorisée sous réserve de mentionner la source.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 border-t border-sand/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/"
            className="text-lagoon font-medium hover:underline"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </section>
    </div>
  );
}
