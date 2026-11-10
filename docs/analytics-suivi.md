# Suivi commercial Zenvilla

## Liens de diffusion

Ces adresses mènent toutes au même site. Les paramètres servent uniquement à distinguer les sources :

- Instagram : https://www.zen-villa.fr/?utm_source=instagram&utm_medium=social&utm_campaign=prospection
- Facebook : https://www.zen-villa.fr/?utm_source=facebook&utm_medium=social&utm_campaign=prospection
- QR code flyer : https://www.zen-villa.fr/?utm_source=flyer&utm_medium=offline&utm_campaign=prospection

Les liens déjà publiés sans paramètres continuent de fonctionner. Leur remplacement dans les biographies doit se faire depuis les comptes sociaux. Une visite ancienne ne peut pas être attribuée rétroactivement. Une provenance peut également être détectée à partir du domaine référent quand le navigateur le fournit.

## Mesures

- `generate_lead` : réponse HTTP de succès du formulaire contact ou demande de prestation ; paramètre `form_type=contact|service`.
- `lead_form_start` : première saisie/focalisation du formulaire pendant son montage.
- `contact_whatsapp`, `contact_phone`, `contact_email` : clics, pas messages reçus ni appels aboutis.
- `appointment_click` : ouverture de Google Agenda, pas rendez-vous confirmé.
- `assistant_open`, `assistant_no_result` : utilisation de l’assistant, sans texte de recherche.

Aucune donnée de formulaire, adresse de destination, numéro ou texte de recherche n’est transmis par ces événements. La collecte dépend de l’accord et exclut les espaces privés. Seuls les paramètres UTM de la campagne ci-dessus sont autorisés dans les pages vues. Le référent est réduit à son origine.

## Exclure ses visites

Pied de page → Gérer les cookies → Exclure mes visites de test. À refaire sur chaque navigateur/appareil utilisé pour tester. Le choix est local au navigateur et peut être annulé depuis ce même panneau. Vider le stockage du navigateur le réinitialise. Les anciennes données Analytics ne sont pas effacées.

## Vérifications

Tester consentement refusé, accepté, exclusion activée et route privée. Une demande invalide ou échouée ne doit pas créer `generate_lead`. Éviter les vrais envois de formulaires de test vers les clients. Les événements personnalisés peuvent ne pas apparaître immédiatement dans les rapports standard ; leur absence historique ne prouve pas une panne.
