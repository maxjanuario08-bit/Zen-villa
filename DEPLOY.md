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
