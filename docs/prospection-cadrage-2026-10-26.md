# Zen Villa — Cadrage de l’outil de prospection

26 octobre 2026 · Proposition avant développement · Référence visuelle fournie par Maxime.

## Recommandation

Faire évoluer le CRM de l’administration Zenvilla, avec un tableau inspiré de la référence et une fiche latérale. Commencer sur Santa Giulia avec des sources réutilisables et une vérification humaine. Le logiciel repère des logements et des exploitants possibles ; il ne peut pas savoir, sans échange, qu’un propriétaire souhaite déléguer.

Objectif pilote : 30 à 50 logements distincts si les sources autorisées les permettent. Cela ne signifie ni 30 à 50 propriétaires identifiés, ni 30 à 50 contacts utilisables commercialement. Ne pas compléter artificiellement une liste insuffisante.

## 1. Interface et parcours

Dans l’administration, réunir **Prospection et propriétaires** dans un même espace commercial, avec trois vues : **Prospects**, **Clients et propriétaires**, **Relances**. Préserver les accès existants aux logements, au planning et à l’équipe.

Reprendre de l’image : recherche globale ; compteurs réels ; tableau filtrable ; sélection d’une ligne ouvrant la fiche à droite ; onglets Informations, Notes, Historique et Tâches. Sur téléphone, la fiche occupe un écran entier avec retour au tableau. Les noms, photos et chiffres de la référence sont uniquement illustratifs : aucun ne sera importé comme donnée réelle.

Filtres : les cinq secteurs prioritaires ; villa, mini-villa, appartement, autre ; particulier identifié, professionnel indépendant, agence/conciergerie, inconnu ; téléphone professionnel vérifié ; email professionnel vérifié ; qualification ; source ; statut commercial ; prochaine relance.

Pipeline : **À vérifier → Qualifié → Contacté → Intéressé → Rendez-vous obtenu → Client**. Ajouter **Non retenu** pour une piste sans intérêt commercial et **Refus de prospection** pour une opposition, qui bloque les sollicitations futures indépendamment du pipeline. La qualification et l’autorisation de contacter sont deux contrôles distincts.

Le bouton « Convertir en client » conserve les notes, l’historique et les biens liés. Associer ensuite, après vérification, le contact au compte propriétaire existant. La conversion ne crée pas automatiquement un compte ni un accès aux logements.

## 2. Ce qui existe et ce qu’il faut ajouter

Le projet utilise déjà Next.js, Vercel, Postgres/Neon et Resend. `AdminCrmDesk`, les routes `/api/owner/admin/crm` et les tables clients/prospects/journal offrent une base utilisable. `AdminDesk` gère déjà l’association des comptes propriétaires aux logements.

Les limites actuelles : le bien est surtout un champ texte ; pas de provenance par information ; pas de séparation entre qualification commerciale et droit de contact ; secteurs incomplets ; pas de recherche de sources ni de suivi des importations. Il faut étendre cette base plutôt que créer un deuxième CRM concurrent.

Architecture proposée :

1. **Interface admin** : tableau paginé, recherche et filtres côté serveur, fiche latérale, tableau des relances et export.
2. **Collecte contrôlée** : import CSV/Excel et connecteur DATAtourisme ; sites officiels examinés selon leurs droits de réutilisation. Chaque import passe d’abord par une zone de vérification.
3. **Normalisation** : noms et domaines normalisés, téléphones au format international, zones documentées, informations inconnues laissées vides.
4. **Dédoublonnage** : identifiants de source, SIRET confirmé, URL de logement et rapprochements nom/adresse. Les rapprochements approximatifs sont proposés à l’humain, jamais fusionnés automatiquement.
5. **Qualification et conformité** : preuves, identité de l’exploitant, nature des coordonnées, finalité du contact et autorisation par canal.
6. **CRM et export** : données validées, historique, relances et passage en client ; aucune campagne automatique dans le pilote.

La collecte sera lancée par un bouton, avec progression et reprise par petits lots persistés en base. Pas de longue collecte dans la requête du navigateur ; pas besoin d’une nouvelle infrastructure de tâches pour le premier pilote.

## 3. Modèle de données

Séparer les entités pour éviter les fausses associations :

- **Logement** : nom public, type, secteur, localité, site officiel, source de localisation et éventuel compte/logement Zenvilla lié.
- **Exploitant/contact** : personne ou organisation ; rôle déclaré/vérifié ; particulier, professionnel indépendant, intermédiaire ou inconnu ; SIRET seulement si confirmé. Un exploitant peut gérer plusieurs biens ; un bien peut avoir plusieurs interlocuteurs.
- **Coordonnée** : valeur, canal, usage professionnel/personnel/inconnu, URL de preuve et date de vérification. Un mobile ou une adresse Gmail n’établit pas à lui seul cette nature.
- **Provenance** : identifiant externe, URL, producteur, licence/permission, date de collecte, dernière mise à jour de la source, date et auteur de validation. Conserver la provenance de chaque information, y compris en cas de fusion.
- **Dossier commercial** : statut, besoins exprimés, prochaine action, notes et historique horodaté.
- **Droits et contactabilité** : base légale documentée, information remise, consentement par canal quand nécessaire, preuve, opposition, échéance de conservation.

Ne pas confondre propriétaire du bien et exploitant : un site de location ou une immatriculation ne constitue pas un titre de propriété. Un SIRET, notamment de loueur en meublé, ne suffit pas à décider automatiquement que le démarchage relève du B2B.

## 4. Sources envisagées

### Priorité : DATAtourisme

Source touristique structurée, gratuite, disponible par API ou fichiers/export CSV. La réutilisation commerciale est prévue sous Licence Ouverte, avec attribution du producteur et date de mise à jour. Cela ne dispense pas du RGPD pour les informations personnelles. La couverture effective des meublés de Santa Giulia reste à mesurer ; aucune exhaustivité promise.

[Accès et conditions DATAtourisme](https://www.datatourisme.fr/utiliser-les-donnees/) · [FAQ et limites](https://www.datatourisme.fr/faq/).

### Sites officiels des logements et offices de tourisme

Consulter les pages de présentation, contact et mentions légales pour vérifier l’activité, l’exploitant et les coordonnées publiées pour cette activité. Une page publique n’autorise pas automatiquement son aspiration ou son exploitation commerciale. Enregistrer la règle applicable à chaque source ; à défaut d’autorisation claire, demander un export/accord au producteur. Respecter les refus, les limites techniques et les droits sur les bases et les images.

### Annuaire des entreprises / Sirene

Vérifier une activité ou une entité déjà repérée, sans chercher à déduire qui possède une villa. Les données Sirene sont gratuites ; les informations personnelles en diffusion partielle ne doivent pas être utilisées pour la prospection. L’absence de résultat ne prouve pas qu’un loueur est un particulier.

[Insee : accès aux données](https://www.insee.fr/fr/information/6790269?question=consulter-et-telecharger-la-base-sirene) · [Conditions de diffusion Sirene](https://www.data.gouv.fr/dataservices/api-sirene-open-data).

### Google Maps : liens utiles, collecte exclue du pilote

Ajouter un lien de recherche Maps à partir d’un nom et d’une localisation obtenus indépendamment, ou un lien précis vérifié humainement. Étiqueter un simple lien de recherche comme tel : il ne prouve pas la correspondance à un établissement. Les Maps URLs ne nécessitent pas de clé API.

Ne pas aspirer Google Maps ni considérer qu’une API officielle donne le droit de stocker et d’exporter une base commerciale. Les conditions EEE interdisent notamment certaines extractions et sauvegardes de contenu ; le stockage/export des données Google doit être étudié avant toute intégration. Pour ce CRM, je recommande de ne pas en faire une source de coordonnées.

[Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) · [Conditions Google Maps EEE, §3.3.2](https://cloud.google.com/terms/maps-platform/eea).

### Airbnb, Booking, Abritel, annuaires privés

Pas de collecte automatisée ni de sollicitation via les messageries de réservation dans le pilote. L’accès public à une annonce n’est pas une autorisation de collecte. Airbnb interdit expressément les robots/scrapers ; chaque autre source demanderait sa propre revue contractuelle et une API ou autorisation adaptée. Aucun abonnement à un extracteur de plateformes n’est proposé.

[Conditions Airbnb](https://www.airbnb.fr/help/article/2908).

## 5. Coûts prévisibles

**Pilote recommandé : 0 € de nouvelle API de données payante**, avec DATAtourisme et imports autorisés. Cela n’inclut pas le temps de vérification, le développement, l’hébergement existant, la base ou l’envoi d’emails. Vérifier les quotas et les offres actuelles avant activation ; ne pas promettre un coût total nul. Ni HubSpot ni une API d’IA ne sont indispensables.

Google Places, si un autre usage admissible est retenu ultérieurement : Text Search Pro, 5 000 requêtes gratuites par mois puis 32 USD/1 000 au premier palier ; Place Details Enterprise, 1 000 gratuites puis 20 USD/1 000. Le téléphone et le site web font partie des champs Enterprise ; l’API ne fournit pas d’email dans les champs documentés.

Exemple purement budgétaire hors franchises : 20 recherches Pro et 50 fiches Enterprise = **1,64 USD**, hors taxes, photos et autres appels. Avec franchises disponibles, ces appels pourraient rester gratuits ; la facturation doit toutefois être activée. Un faible coût ne lève pas les restrictions d’usage et ne permet pas de garantir 50 prospects.

[Tarifs Google vérifiés le 26/10/2026](https://developers.google.com/maps/billing-and-pricing/pricing) · [Champs Places](https://developers.google.com/maps/documentation/places/web-service/data-fields.md).

## 6. Règles de contact à intégrer

**Particuliers** : pas de prospection commerciale par email/SMS sans consentement préalable dans le cas général. Une coordonnée publiée pour recevoir des demandes de location ne vaut pas accord pour recevoir une offre de conciergerie.

**Professionnels indépendants** : un email de prospection peut, sous conditions, se passer de consentement préalable si l’offre est en rapport avec l’activité, que la personne est informée et peut s’opposer simplement. Ce contrôle porte sur le contexte réel, pas seulement sur le domaine de l’email.

[CNIL : prospection électronique](https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique-sms-mms-et-automate-dappel) · [CNIL : communications professionnelles](https://www.cnil.fr/fr/communication-electronique-quelles-regles).

**Téléphone vers des consommateurs** : depuis le 11 août 2026, le consentement préalable est en principe nécessaire, sous les exceptions légales. Ne pas concevoir le logiciel sur l’ancien principe « numéro public et absent de Bloctel = appel possible ».

[Service Public : règles depuis août 2026](https://www.service-public.gouv.fr/particuliers/vosdroits/F33267).

**Collecte indirecte** : documenter la base légale dès la collecte. Informer la personne au plus tard sous un mois et, si cela intervient avant, au premier contact ou à la première transmission. Une simple validation humaine ne rend pas licite une collecte ou une sollicitation interdite.

[CNIL : réutilisation des données Internet, fiche 3](https://www.cnil.fr/sites/default/files/2024-06/recommandations_reutilisateurs_donnees_publiees_sur_internet.pdf).

**Conservation** : prévoir une revue et une purge ; la CNIL donne comme référence trois ans pour les prospects à compter de la collecte ou du dernier contact venant du prospect. Une relance sortante ne redémarre pas ce délai. Conserver séparément les seules informations nécessaires pour respecter une opposition, selon une durée documentée.

[CNIL : conservation commerciale](https://www.cnil.fr/fr/questions-reponses-sur-les-referentiels-relatifs-la-gestion-des-activites-commerciales-et-des).

Règle produit : les contacts inconnus restent non contactables ; les oppositions s’appliquent à tous les logements et imports du même contact. Les boutons Appeler/Écrire et les exports commerciaux sont bloqués tant que les conditions du canal ne sont pas validées. La validation reste manuelle ; aucune séquence de démarchage automatique.

## 7. Comment trouver les meilleures pistes

Prioriser les logements dans le secteur d’intervention immédiat de Zenvilla, les exploitants indépendants confirmés et les besoins compatibles avec une offre d’entrée : ménage, linge, accueil ou relais local. Une prestation ponctuelle peut ouvrir une relation avant une gestion complète.

Prévoir une priorité explicable, sans prétendre prédire l’intérêt : secteur 30 points, indépendance vérifiée 20, canal professionnel utilisable et vérifié 20, adéquation documentée aux prestations 15, besoin explicitement exprimé 15. Toute composante inconnue vaut zéro, pas une supposition. Un score élevé ne contourne jamais un refus ou une absence d’autorisation de contact.

Ne pas inférer l’insatisfaction d’un propriétaire à partir d’une annonce, ni son absence, ses revenus, sa situation familiale ou son domicile. Les agences et grandes conciergeries vont dans une catégorie séparée ; d’éventuels partenariats se traitent dans un autre parcours.

## 8. Pilote Santa Giulia et critères de réussite

1. Vérifier la couverture DATAtourisme et les droits de 2 ou 3 sources locales. Échantillon initial de 10 logements pour mesurer les données réellement disponibles.
2. Étendre à 30–50 logements distincts seulement si les sources le permettent ; sinon livrer le nombre réel et les raisons des exclusions, sans élargir discrètement à Porto-Vecchio.
3. Pour chaque ligne : identité du logement, zone justifiée, source et dates ; statut de l’exploitant documenté ou inconnu ; coordonnées absentes laissées vides ; validation humaine et contactabilité distinctes.
4. Présenter des comptes séparés : logements repérés, exploitants confirmés, contacts professionnels validés, contacts autorisés par canal. Dédupliquer les biens et les contacts séparément.
5. Tester filtres, relances, ouverture de fiche, conservation de l’historique à la conversion, blocage d’une opposition et absence de doublons au réimport.
6. Livrer un CSV UTF-8 et un vrai classeur XLSX : Logements, Contacts validés, Sources, Suivi. Export daté, respect des licences, cellules texte protégées contre les formules injectées. Les contacts personnels/non validés sont exclus de l’export commercial par défaut.

Ordre géographique après le pilote : Palombaggia ; Bocca dell’Oro/Piccovaggia ; Porto-Vecchio ; Cala Rossa/Lecci/Saint-Cyprien. Ces secteurs ne sont pas tous des communes : la zone ne sera pas déduite du seul code postal.

## 9. Sécurité et limites du premier périmètre

Accès admin uniquement aux pistes commerciales, exports et paramètres des sources ; aucun accès pour les voyageurs, propriétaires ou intervenants ménage. Autorisation vérifiée côté serveur sur toutes les routes. Identifiants de source conservés côté serveur ; quotas de collecte, domaines autorisés, protection SSRF, journal d’import et tests de droits d’accès.

Les images de la maquette ne seront pas réutilisées comme photos de biens. Une vignette exigera un droit d’utilisation vérifié ; son absence ne bloque pas une fiche. Ne pas copier les comptes propriétaires ni modifier les réservations existantes lors de la migration CRM.

À cette étape : architecture et étude des sources uniquement. Aucune collecte de 30–50 fiches, aucun achat d’API, aucun message commercial et aucune modification du site en production n’ont été effectués pour ce projet de prospection.
