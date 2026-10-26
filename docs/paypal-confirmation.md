# Confirmation PayPal → séjour → planning → emails

Le paiement utilise PayPal Payments Standard. Le site transmet `custom`/`invoice` (référence opaque de réservation) et `notify_url=https://www.zen-villa.fr/api/paypal/ipn`. Le simple retour du navigateur ne confirme jamais le paiement. La page de retour interroge le statut et recharge les disponibilités après confirmation.

## Traitement serveur
- Notification authentifiée par postback au serveur PayPal de production.
- Statut Completed uniquement, rejet du simulateur en production, contrôle du bénéficiaire (email ou identifiant marchand configuré), transaction obligatoire, montant exact en centimes et EUR.
- Création du séjour `booked_by=site` et mise à jour de la réservation en une transaction Neon sérialisable. Identifiant de séjour stable et index unique de transaction PayPal ; nouvelles tentatives sans séjour supplémentaire.
- L’agenda public, le planning admin et le compte propriétaire utilisent déjà les séjours stockés. Aucune seconde base de calendrier.
- Emails voyageur, administrateur et propriétaires associés attendus avant réponse positive. Les destinataires acceptés sont mémorisés durablement ; nouvelle tentative limitée aux échecs. Clé d’idempotence Resend pour la fenêtre entre acceptation et sauvegarde.
- Un échec temporaire produit HTTP 503 pour demander une nouvelle livraison PayPal ; aucun succès silencieux. Le séjour reste bloqué même si un email échoue. Un chevauchement est signalé pour traitement manuel, sans effacer un séjour existant.

## Migrations additives
`pending_bookings.paypal_txn_id`, `paid_at`, index unique sur transaction non vide ; table `booking_mail_deliveries`. Appliquées par `ensureOwnerSchema`, sans suppression de données.

## Configuration
Variables existantes `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM`. `PAYPAL_BUSINESS_EMAIL` optionnelle, sinon contact@zen-villa.fr ; doit correspondre à l’adresse du compte qui reçoit le paiement. `PAYPAL_MERCHANT_ID` optionnel permet de vérifier le bénéficiaire par ID marchand. Le lien de paiement utilise le même email configuré.

Dans PayPal professionnel → Paramètres du compte → Notifications → Notifications instantanées de paiement, vérifier que la réception n’est pas désactivée et que l’URL est correcte. L’historique IPN indique l’état de livraison et permet de renvoyer une notification existante après correction. Un identifiant de réservation Zen Villa n’est pas un identifiant de transaction PayPal.

## Paiement test du 26 octobre 2026
La réservation `4d69bf20728ead8b39977412`, du 1 au 3 novembre, total 2 €, était encore pending lors du diagnostic, sans séjour. Ne pas la marquer automatiquement payée à partir d’un paramètre de navigateur ou d’une référence : il faut la notification PayPal vérifiée. Après renvoi de l’IPN, elle doit passer à paid, créer un seul séjour et notifier ses propriétaires liés. Aucun nouveau paiement requis.

## Vérifications
Tests PayPal : signature par postback simulée, contrôle du destinataire/montant/devise, transaction manquante et simulateur refusés, attente/pannes/retries, conservation du jour Paris pour DATE Neon, sérialisation/idempotence du règlement, notifications indépendantes et persistantes. Les tests n’effectuent aucun paiement réel et n’envoient aucun email réel. Une notification réelle demeure nécessaire pour valider le flux bout en bout avec le compte marchand.
