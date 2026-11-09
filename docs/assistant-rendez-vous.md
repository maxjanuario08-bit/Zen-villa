# Assistant FAQ et rendez-vous — 4 novembre 2026

## En place

- Assistant FAQ FR/EN/ES sur les pages publiques ; masqué dans les espaces privés et le livret.
- 15 sujets originaux, recherche locale sans IA ni conservation des questions, réponses développables et liens utiles.
- Contact WhatsApp, téléphone, email et formulaire existant. Aucun message n’est envoyé automatiquement par l’assistant.
- Rubrique /contact#rendez-vous et accès direct au formulaire /contact#formulaire.
- Sans calendrier configuré, proposition de rendez-vous par email/WhatsApp ; aucun faux créneau disponible.

## Relier Google Agenda avec l’adresse Hostinger

Un compte Google peut être créé avec contact@zen-villa.fr sans transférer la messagerie chez Google. Créer un compte Google en choisissant l’adresse existante et valider l’email reçu chez Hostinger. Utiliser l’identité Zenvilla. Éviter de simplement ajouter l’adresse comme alias d’un compte Gmail personnel si l’objectif est de ne pas afficher le compte personnel.

Dans Google Agenda sur ordinateur, créer un planning de rendez-vous. Choisir par exemple une durée de 20 minutes, les jours/heures disponibles, un délai minimum et les pauses entre rendez-vous. Vérifier le nom et l’adresse de l’organisateur sur la page publique et dans une invitation test. Google peut gérer les disponibilités dans l’agenda sélectionné ; certaines fonctions multi-agendas et les rappels sont payants selon le compte.

Copier le lien public de réservation. Définir NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL dans Vercel pour l’environnement concerné, puis redéployer. C’est une URL publique, jamais un mot de passe ou une clé. Les liens acceptés sont https://calendar.app.google/... et https://calendar.google.com/.../appointments/schedules/....

Une fois configuré, « Voir les créneaux disponibles » ouvre la page Google dans un nouvel onglet. Aucun agenda tiers ne charge avant ce clic. Le formulaire Zenvilla et la prise de rendez-vous Google sont deux démarches distinctes : aucune création automatique de prospect à ce stade.

## Validation finale requise après ajout du lien

- Vérifier l’identité professionnelle affichée et la disponibilité réelle.
- Réserver un créneau test avec une autre adresse et vérifier les invitations.
- Vérifier qu’un créneau occupé disparaît, puis l’annulation.
- Vérifier fuseau horaire et comportement sur mobile.

## Contenus

Données : data/assistant-faq.json. Textes d’interface : messages/locales/{fr,en,es}/assistant.ts.
Les questions reflètent les thèmes fréquents du secteur, avec des réponses propres à Zenvilla ; pas de copie des engagements d’une autre conciergerie. Toute évolution de prix, formules, secteurs ou processus doit être répercutée dans les trois langues.

Références : https://support.google.com/accounts/answer/27441?hl=fr ; https://support.google.com/calendar/answer/11608416?hl=fr ; https://support.google.com/calendar/answer/16287038?hl=fr


## Évolution du 9 novembre 2026

L’assistant construit désormais son index à partir de la FAQ de base et des contenus publics traduits : services propriétaires et voyageurs, chaque ligne du catalogue tarifaire, équipements, capacité et modalités de réservation de Pinson, ainsi que les langues parlées. La sélection est explicite dans `lib/assistant-knowledge.ts` ; aucune lecture des comptes, du CRM ou des réservations. Les nouvelles prestations et modifications de ces catalogues sont reprises à la prochaine compilation.

La recherche normalise les accents et quelques synonymes, vérifie les correspondances et limite l’affichage à cinq réponses (six suggestions au départ). Une recherche sans résultat propose le lien Google Agenda directement, sans ouverture automatique pendant la saisie. Les demandes de disponibilité renvoient au calendrier réel au lieu de confirmer des dates. L’assistant reste une recherche dans les contenus publiés, sans génération IA : les formulations très éloignées du vocabulaire du site peuvent nécessiter le rendez-vous.

La page Google fournie est `https://calendar.app.google/qPt4zxxzPdqE9mMV7`, définie comme lien public par défaut dans `lib/appointments.ts`. Une variable publique valide peut la remplacer. Les rendez-vous et les liens Meet sont gérés dans le planning Google, pas créés par le moteur de recherche FAQ.
