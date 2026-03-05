import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, COMPANY, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité, protection des données (RGPD) et gestion des cookies du site Zenvilla – Conciergerie Corse Sud.",
  robots: { index: true, follow: true },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div>
      <section className="py-16 sm:py-24 bg-gradient-to-b from-sand-light to-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-lagoon-dark">
            Politique de confidentialité
          </h1>
          <p className="mt-4 text-foreground/80">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12 text-foreground/90 leading-relaxed">
          <div>
            <p>
              {COMPANY.name}, dont le siège est situé au {COMPANY.address}, s'engage à protéger la vie privée des utilisateurs de son site {SITE.url}. Cette politique de confidentialité a pour objet de vous informer sur la collecte, l'utilisation et la protection de vos données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « informatique et libertés » du 6 janvier 1978 modifiée.
            </p>
          </div>

          {/* RGPD */}
          <div>
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              1. Responsable du traitement
            </h2>
            <p>
              Le responsable du traitement des données personnelles est {COMPANY.name}, représenté par {COMPANY.director}, Directeur de la publication.
            </p>
            <p className="mt-4">
              <strong>Adresse :</strong> {COMPANY.address}<br />
              <strong>Email :</strong>{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-lagoon hover:underline">
                {CONTACT.email}
              </a>
              <br />
              <strong>Téléphone :</strong>{" "}
              <a href={`tel:${CONTACT.telephoneRaw}`} className="text-lagoon hover:underline">
                {CONTACT.telephone}
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              2. Données collectées
            </h2>
            <p>Nous pouvons collecter les données personnelles suivantes :</p>
            <ul className="mt-4 list-disc list-inside space-y-2">
              <li><strong>Formulaire de contact :</strong> nom, adresse email, numéro de téléphone, ville/zone, type de bien, message</li>
              <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées (via cookies – voir section Cookies)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              3. Finalités du traitement
            </h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="mt-4 list-disc list-inside space-y-2">
              <li>Répondre à vos demandes de contact et de devis</li>
              <li>Vous contacter dans le cadre de nos services de conciergerie</li>
              <li>Améliorer le fonctionnement et l'expérience utilisateur du site</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              4. Base légale
            </h2>
            <p>
              Le traitement de vos données repose sur : votre consentement (formulaire de contact), l'exécution de mesures précontractuelles (réponse à une demande de devis), et notre intérêt légitime (amélioration du site).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              5. Durée de conservation
            </h2>
            <p>
              Les données du formulaire de contact sont conservées pendant 3 ans à compter du dernier contact, puis supprimées. Les données nécessaires à la tenue de notre comptabilité sont conservées 10 ans conformément aux obligations légales.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              6. Destinataires des données
            </h2>
            <p>
              Vos données ne sont pas vendues ni louées. Elles peuvent être transmises à nos prestataires techniques (hébergeur) dans le cadre strict de la fourniture de leurs services. Nous ne transférons pas vos données en dehors de l'Union européenne sans garanties appropriées.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              7. Vos droits
            </h2>
            <p>
              Conformément au RGPD et à la loi « informatique et libertés », vous disposez des droits suivants :
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> faire corriger des données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> demander la limitation du traitement dans certains cas</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            </ul>
            <p className="mt-6">
              Pour exercer ces droits, contactez-nous à{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-lagoon hover:underline">
                {CONTACT.email}
              </a>
              . Vous disposez également du droit d'introduire une réclamation auprès de la CNIL :{" "}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-lagoon hover:underline">
                www.cnil.fr
              </a>
              .
            </p>
          </div>

          {/* Cookies */}
          <div id="cookies">
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              8. Cookies
            </h2>
            <p>
              Ce site utilise des cookies pour améliorer votre expérience de navigation et assurer son bon fonctionnement.
            </p>

            <h3 className="text-lg font-medium text-lagoon-dark mt-6 mb-3">
              Qu'est-ce qu'un cookie ?
            </h3>
            <p>
              Un cookie est un fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone) lors de la visite d'un site. Il permet de mémoriser des informations sur votre navigation.
            </p>

            <h3 className="text-lg font-medium text-lagoon-dark mt-6 mb-3">
              Types de cookies utilisés
            </h3>
            <ul className="space-y-2">
              <li>
                <strong>Cookies strictement nécessaires :</strong> indispensables au fonctionnement du site (par ex. mémorisation de votre consentement aux cookies). Ces cookies ne nécessitent pas votre consentement préalable.
              </li>
              <li>
                <strong>Cookies de préférences :</strong> permettent de mémoriser vos choix (langue, affichage). Ils ne sont déposés qu'avec votre consentement.
              </li>
              <li>
                <strong>Cookies analytiques :</strong> nous aident à comprendre comment les visiteurs utilisent le site (pages les plus consultées, temps passé). Ils ne sont déposés qu'avec votre consentement.
              </li>
            </ul>

            <h3 className="text-lg font-medium text-lagoon-dark mt-6 mb-3">
              Gestion des cookies
            </h3>
            <p>
              Vous pouvez à tout moment modifier vos préférences en matière de cookies via le bandeau affiché lors de votre première visite, ou en supprimant les cookies via les paramètres de votre navigateur.
            </p>
            <p className="mt-4">
              La désactivation de certains cookies peut affecter le bon fonctionnement de certaines fonctionnalités du site.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              9. Sécurité
            </h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-lagoon-dark mb-6">
              10. Modifications
            </h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité. Toute modification sera publiée sur cette page avec la date de mise à jour. Nous vous encourageons à la consulter régulièrement.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 border-t border-sand/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/mentions-legales" className="text-lagoon font-medium hover:underline">
            Mentions légales
          </Link>
          <Link href="/" className="text-lagoon font-medium hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </section>
    </div>
  );
}
