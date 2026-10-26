# Déploiement Zenvilla sur GitHub et Vercel

## 1. Créer le repo GitHub (nouveau, séparé d'astrogochi)

1. Va sur **https://github.com/new**
2. **Repository name :** `zenvilla`
3. **Description :** Site internet Zenvilla – Conciergerie Corse Sud
4. Choisis **Public**
5. Ne coche **pas** "Add a README" (le projet en a déjà un)
6. Clique sur **Create repository**

## 2. Pousser le code sur GitHub

Dans le terminal, depuis le dossier `zenvilla` :

```bash
cd /Users/maximejanuario/Desktop/zenvilla

# Remplace TON_USERNAME_GITHUB par ton identifiant GitHub
git remote add origin https://github.com/TON_USERNAME_GITHUB/zenvilla.git

git push -u origin main
```

## 3. Déployer sur Vercel

1. Va sur **https://vercel.com**
2. Clique sur **Add New...** → **Project**
3. **Import Git Repository** : sélectionne le repo **zenvilla** (pas astrogochi)
4. Vercel détecte Next.js → clique sur **Deploy**
5. Une fois le déploiement terminé, clique sur **Settings** → **Domains**
6. Ajoute **zen-villa.fr** comme domaine personnalisé

## 4. Configurer le domaine zen-villa.fr

Chez ton registrar (où tu as acheté zen-villa.fr) :

- Ajoute un enregistrement **A** ou **CNAME** vers Vercel (les valeurs exactes sont indiquées dans Vercel → Settings → Domains)

---

**Important :** Zenvilla et astrogochi sont deux repos distincts. Ce projet est dans `/zenvilla` uniquement.

## 5. Espace membre en production (Vercel)

Le disque Vercel est éphémère : comptes et calendriers **doivent** aller dans Postgres.

1. Vercel → projet Zenvilla → **Storage** → **Create Database** (Neon Postgres). Relie-la au projet : `DATABASE_URL` (ou `POSTGRES_URL`) est ajouté tout seul.
2. Vercel → **Settings** → **Environment Variables** (Production + Preview) :

| Variable | Valeur |
| --- | --- |
| `DATABASE_URL` | fournie par Neon / Storage |
| `OWNER_SESSION_SECRET` | `openssl rand -base64 48` (unique, ≥ 32 caractères) |
| `OWNER_ADMIN_SECRET` | autre secret long (API, optionnel) |
| `OWNER_ADMIN_EMAIL` | `contact@zen-villa.fr` |
| `OWNER_ADMIN_PASSWORD` | mot de passe de la page `/admin` (toi seul) |
| `STAFF_PASSWORD` | code d’accès `/equipe` (optionnel, sinon le code équipe déjà en place) |
| `OWNER_SEED_DEMO` | `false` |

3. **Redeploy** après avoir sauvé les variables.
4. Un propriétaire s’inscrit sur `/inscription`. Tu l’associes sur **https://www.zen-villa.fr/admin** : email admin + mot de passe → villa → **Associer**.

Sans `DATABASE_URL` + secret de session valides, l’inscription et la connexion sont refusées en production (503).


## Réinitialisation des mots de passe

Les connexions admin, propriétaire et équipe proposent « Mot de passe oublié ».
`DATABASE_URL`, `RESEND_API_KEY` et un `RESEND_FROM` vérifié sont nécessaires.
Les tables `account_passwords` et `password_reset_tokens` sont créées automatiquement, sans modifier les comptes ou réservations existants.
Les liens expirent après 30 minutes ; seuls leurs condensats SHA-256 sont conservés.
La consommation du lien et la modification du mot de passe sont atomiques.
Les nouveaux mots de passe (12 à 128 caractères) sont hachés avec scrypt.
Après une réinitialisation, la valeur hachée dans `account_passwords` remplace le mot de passe initial du compte ; pour l’admin, `OWNER_ADMIN_PASSWORD` sert seulement avant la première réinitialisation.
Une modification de cette variable ne remplace donc pas un mot de passe déjà réinitialisé.
Les anciennes sessions et les autres liens antérieurs au changement deviennent invalides.
Les pages de récupération ne sont pas indexées et les URL de réinitialisation sont exclues de Vercel Analytics.
Validation locale : `node --test tests/password-reset.test.cjs`.

## Google Analytics 4

La balise `G-0EWN4TFMJ2` est installée dans `components/GoogleAnalytics.tsx`.
Elle ne se charge qu’après acceptation du bandeau cookies. Le pied de page permet de modifier ce choix.
Le suivi manuel exclut les espaces privés et supprime les paramètres et fragments des URL envoyées.
Dans Google Analytics → Administration → Flux de données → Web → Mesures améliorées → Pages vues → Paramètres avancés, désactiver **Changements de page basés sur les événements de l’historique du navigateur**, car le site envoie déjà les vues lors des navigations Next.js. Cela évite les doublons et les vues automatiques des espaces exclus.
Vérifier ensuite la collecte dans le rapport Temps réel, avec les cookies acceptés et sans bloqueur de publicité.
