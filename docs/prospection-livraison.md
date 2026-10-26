# Prospection et bibliothèque commerciale — livraison du 26 octobre 2026

## Accès et fonctions
Administration → Prospection → Mes prospects / Modèles & Scripts. Aucune nouvelle page principale publique.

- Tableau, recherche, filtres de zone/type/exploitant/qualification/statut/source/coordonnées vérifiées, pagination et indicateurs réels.
- Fiche latérale : informations du bien et du contact, preuves par champ, notes, historique, tâches, relances, statut et conversion dans la base clients existante. Association à un compte propriétaire existant ; aucun accès propriétaire créé implicitement.
- Statuts système renommables et réordonnables, étapes personnalisées ajoutables.
- Bibliothèque initiale de 25 modèles : 6 emails, 4 appels avec sections distinctes, 5 WhatsApp, 4 argumentaires, 6 objections. Textes du cahier des charges, signatures centralisées ; l’email 06 ne prétend pas joindre un document.
- Édition complète, création, duplication, archivage, suppression, classement, catégories, variables et restauration d’une version précédente. Protection des brouillons contre une navigation accidentelle ; conflit de modification signalé.
- Préparation depuis la fiche prospect avec données explicites uniquement, complétion manuelle et prévisualisation. Copie ou ouverture email/WhatsApp/téléphone ; aucun envoi automatique. Enregistrement distinct d’une préparation et d’un échange confirmé manuellement.
- Import CSV/XLSX avec prévisualisation et confirmation du droit de réutilisation (2 Mo, 1 000 lignes ; lots de 10). Déduplication par identifiant de source ou identité de bien corroborée. Export CSV et XLSX à quatre onglets, avec protection contre les formules CSV.
- Coordonnées non vérifiées/personnelles masquées dans les exports commerciaux. Opposition transversale par email/téléphone, blocage côté serveur, contrôle de la base légale et des preuves. Consentement WhatsApp distinct. Expiration bloque les sollicitations mais ne purge pas automatiquement les données : prévoir une revue périodique.

## Sources et limites
Le bouton « Rechercher des pistes » présente un extrait DATAtourisme daté du 26 octobre 2026, sous Licence Ouverte, avec attribution et URL source. 126 points à Porto-Vecchio examinés : trois résidences collectives à Santa Giulia identifiées, aucun propriétaire individuel confirmé. Les grandes structures sont classées séparément. L’objectif 30–50 fiches n’est pas atteint : aucune fiche ni coordonnée inventée.

Il ne s’agit pas d’un moteur de recherche universel en direct : pas de scraping Google Maps/Airbnb, pas d’API payante activée, pas de surveillance automatique. Les liens Maps sont des recherches et non des fiches certifiées. Actualiser l’extrait et compléter par imports autorisés ou saisie terrain. Vérification humaine nécessaire avant utilisation commerciale. Consulter le cadrage juridique et des sources dans `prospection-cadrage-2026-10-26.md`.

Interface CRM nouvelle en français ; le reste du site conserve ses langues existantes. La recherche charge la base avant filtrage : adaptée au prototype, à faire évoluer vers des requêtes SQL paginées si le volume devient important. Les contacts d’un même canal peuvent être regroupés sans prouver l’identité juridique du propriétaire. Conversion idempotente par fiche, sans dédupliquer automatiquement des clients déjà créés pour d’autres fiches.

## Persistance et migrations additives
Aucune table existante supprimée. Les ajouts sont idempotents et exécutés par les conventions existantes :

- `lib/owner-pg.ts` : colonnes `crm_prospects.profile_json`, `client_id` ; tables `crm_contact_records`, `crm_property_records`, `crm_oppositions`, `crm_tasks` ; index tâches et identifiant de source unique.
- `lib/prospect-pipeline.ts` : `crm_pipeline_config`, initialisée avec `ON CONFLICT DO NOTHING`.
- `lib/sales-library.ts` : `sales_library_state` JSONB, révision et version d’initialisation. Initialisation une seule fois ; les déploiements ne rétablissent ni modèles modifiés ni modèles supprimés. Révision conditionnelle contre les écritures concurrentes.

Production : réutilise `DATABASE_URL` Neon existante, aucune clé API supplémentaire. Ne pas utiliser le stockage JSON local sur Vercel. Le repli local sert au développement uniquement ; `ZENVILLA_CRM_TEST_DIR` isole les scénarios de test et est ignoré en production.

## Principaux fichiers
UI : `components/owner/{ProspectBoard,ProspectDrawer,SalesLibrary,SalesComposer}.tsx` ; intégration `AdminCrmDesk.tsx`, `AdminWorkspace.tsx`.
Domaine : `lib/prospect-{model,store,pipeline,files}.ts`, `lib/sales-library{,-types,-seed,-render}.ts`, `lib/admin-navigation.ts`, `lib/local-crm-path.ts`.
API : `app/api/owner/admin/prospection/**`, `app/api/owner/admin/sales-library/route.ts` ; anciennes routes CRM réutilisent les contrôles prospect.
Données autorisées : `data/prospection/santa-giulia.json`. Dépendance export : ExcelJS. Mise à jour corrective Next.js/eslint-config-next 16.4.3.

## Validation et mise en production
- Tests unitaires bibliothèque, rendu des variables, seed idempotent, conflits, historique et contrôle d’accès ; tests existants mots de passe et Analytics.
- Scénario HTTP sur serveur local isolé : accès anonyme refusé, dédoublonnage, qualification, blocage avant vérification, tâches, export XLSX relu, conversion répétée, opposition transversale, consentement WhatsApp, persistance des modèles.
- Vérification visuelle : édition/sauvegarde/rechargement d’un email, import prévisualisé, fiches et modèles. Aucun message envoyé à un prospect.
- TypeScript, lint ciblé des fichiers livrés et build de production (`npm run build -- --webpack`). Turbopack est bloqué localement par une restriction de création de port CSS ; compilation Webpack réussie. Le lint global contient des erreurs préexistantes ailleurs dans le site ; il n’est pas déclaré entièrement vert.

Déployer la branche contenant ces fichiers dans le projet Vercel **zen-villa** existant. La première consultation authentifiée initialise les tables et les 25 modèles. Vérifier ensuite les deux onglets, les accès refusés sans session et un export. Ne pas importer les données fictives des tests en production.
