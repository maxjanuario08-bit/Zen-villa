# Zenvilla – Conciergerie Corse Sud

Site vitrine premium pour **Zenvilla**, solution complète et digitale de conciergerie destinée aux propriétaires de villas et aux voyageurs en Corse Sud.

## Stack technique

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- SEO (metadata, OpenGraph, sitemap)
- Responsive mobile-first, animations légères

## Structure du projet

```
zenvilla/
├── app/
│   ├── layout.tsx          # Layout racine + métadonnées globales
│   ├── page.tsx            # Accueil
│   ├── globals.css         # Design system + animations
│   ├── sitemap.ts          # Sitemap généré
│   ├── contact/
│   │   ├── layout.tsx      # Métadonnées page contact
│   │   └── page.tsx        # Formulaire + FAQ
│   ├── proprietaires/
│   │   └── page.tsx
│   ├── voyageurs/
│   │   └── page.tsx
│   └── packs/
│       └── page.tsx
├── components/
│   ├── Navbar.tsx          # Navigation sticky
│   ├── Footer.tsx          # Pied de page
│   └── ui/
│       ├── Button.tsx      # Bouton pill
│       └── Card.tsx        # Carte arrondie
└── ...
```

## Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start
```

## Métadonnées SEO (titres & descriptions)

| Page | Meta Title | Meta Description |
|------|------------|------------------|
| **Accueil** | Zenvilla – Conciergerie Corse Sud \| Villas de prestige | Solution complète et digitale de conciergerie pour propriétaires de villas et voyageurs en Corse Sud. Transparence, simplicité, services personnalisés. |
| **Propriétaires** | Propriétaires – Conciergerie villa Corse Sud \| Zenvilla | Confiez la gestion de votre villa en Corse Sud à Zenvilla. Gain de temps, qualité premium, transparence via notre application, assistance 7j/7. |
| **Voyageurs** | Voyageurs – Prestations & services villa Corse \| Zenvilla | Profitez de prestations premium pour votre séjour en villa en Corse Sud : transport, petit-déjeuner, activités nautiques, location équipement et véhicules. |
| **Packs** | Packs – Zen Tranquillité, Zen Premium, Zen Flex \| Zenvilla | Découvrez nos 3 packs conciergerie : Zen Tranquillité (essentiel), Zen Premium (tout inclus), Zen Flex (à l'usage). Tarifs transparents. |
| **Contact** | Contact – Devis et informations \| Zenvilla | Contactez Zenvilla pour un devis personnalisé. Réponse rapide 7j/7. Propriétaires de villas et voyageurs en Corse Sud. |

## Design system

- **Couleurs** : bleu lagon (`#2d7a8f`), sable (`#e8dcc8`), blanc
- **Typographie** : Cormorant Garamond (titres), Source Sans 3 (corps)
- **Boutons** : pill (rounded-full), ombres légères
- **Cartes** : rounded-2xl, bordure sand, hover léger

## Formulaire de contact

Le formulaire intègre :
- Validation (nom, email, téléphone, message requis)
- Envoi par `mailto:` (à remplacer par un endpoint API en production)
- Champs : Nom, Email, Téléphone, Ville/zone, Type de bien, Message

## Configuration

Pour le déploiement, adapter si besoin :
- `app/sitemap.ts` : variable `baseUrl` selon le domaine final
- Formulaire : remplacer le `mailto` par un véritable endpoint (API route, Formspree, etc.)
