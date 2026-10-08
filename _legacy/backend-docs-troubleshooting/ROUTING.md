# Routing modules-v2

Le router v2 est monté dans `backend/src/server.js`, à l'intérieur du IIFE
`loadModules()`, juste après l'enregistrement des routes v1 :

```js
const { default: buildV2Router } = await import('../modules-v2/index.js');
const v2Router = await buildV2Router();
app.use(v2Router);
```

Le montage est protégé par `try/catch` : en cas d'erreur, seules les routes
v1 restent actives — le serveur ne plante pas.

## Préfixe

Toutes les routes v2 sont exposées sous `/api/v2/*` (défini dans
`modules-v2/index.js` via `router.use('/api/v2/${group}/${slug}', ...)`).

Aucun conflit avec les routes v1 qui utilisent `/api/*` sans le segment
`/v2/`. Le rate limiter global `app.use('/api/', ...)` couvre les deux.

## Groupes exposés (via `modules-v2/index.js`)

- `/api/v2/ventes/*` — devis, commandes, bl, factures, avoirs, paiements,
  colis, palettes
- `/api/v2/achats/*` — fournisseurs, bc, receptions, factures-fournisseur
- `/api/v2/comptabilite/*` — ecritures, tva, caisse, cloture
- `/api/v2/rh/*` — employes, contrats, paies, pointages, conges,
  candidatures, cnss, irpp, primes-cagnottes, primes-scores,
  primes-bordereaux, tv-atelier
- `/api/v2/ia-agents/*` — agents, runs, findings, scheduler
- `/api/v2/comms/*` — messages, notifications, whatsapp, email
- `/api/v2/personnalisation/*` — config, commandes, referentiels, partages
- `/api/v2/ecommerce/*` — sites, comptes-b2b, commandes-web, sync, promo
- `/api/v2/publicite/*` — comptes, campagnes, metriques, conversions

Les slugs différents du nom de module sont définis via `routeSlug` dans
`modules-v2/index.js` (ex : `factures-ff` → `factures-fournisseur`,
`recrutement` → `candidatures`, `messagerie` → `messages`).

## Cohabitation v1 / v2

Les routes v1 restent actives sous `/api/*` (chargées via
`backend/src/core/ModuleManager.js`). Migration progressive : dès qu'une
route v2 est stable côté frontend, désactiver son équivalent v1.

## Ajouter un nouveau groupe / module

Éditer `backend/modules-v2/index.js` :

1. Ajouter l'entrée dans `groups` (`[groupe, [module1, module2, ...]]`).
2. Si le slug URL diffère du nom de module, l'ajouter dans `routeSlug`.
3. Créer `modules-v2/<groupe>/<module>/routes.js` qui exporte un
   `Router` Express par défaut.

Aucune modification de `server.js` n'est nécessaire — `buildV2Router()`
itère automatiquement sur `groups`.
