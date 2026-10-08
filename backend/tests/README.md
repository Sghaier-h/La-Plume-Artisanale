# Tests backend — ERP La Plume Artisanale

Ce dossier regroupe les tests **Jest** (ESM) du backend. Deux familles
cohabitent :

| Suite | Fichier | Type | Dépendances |
| --- | --- | --- | --- |
| Workflow ventes bout-en-bout | `integration/workflow.test.js` | HTTP live | serveur backend démarré + DB accessible |
| Webhooks e-commerce Shopify/Woo | `integration/ecommerce-webhooks.test.js` | Isolé (mocks ESM in-memory) | aucune |

## Prérequis

```bash
cd backend
npm install         # installe jest + cross-env (devDependencies)
```

Jest utilise les ES modules → toutes les commandes passent par
`NODE_OPTIONS=--experimental-vm-modules`, déjà encapsulé par les scripts npm.

## Lancer les tests

Tous les tests :

```bash
cd backend
npm test
```

Suite webhook uniquement (n'exige **pas** de serveur ni de DB) :

```bash
cd backend
npm test -- tests/integration/ecommerce-webhooks.test.js
```

Suite workflow ventes (exige serveur backend + DB) :

```bash
# 1) Terminal 1 : démarrer le backend en mode mock-auth
cd backend
NODE_ENV=development USE_MOCK_AUTH=true npm run dev

# 2) Terminal 2 : lancer la suite
cd backend
npm run test:integration
```

## Suite `ecommerce-webhooks.test.js`

- **Stratégie DB** : Option B — **mock in-memory** via
  `jest.unstable_mockModule` sur :
  - `modules-v2/ecommerce/commandes-web/model.js`
  - `modules-v2/ecommerce/sites/service.js`
- **Ce qui est exercé pour de vrai** :
  - middleware `express.raw` de `routes.js`
  - validation HMAC (`_shared/crypto.js` — `verifyShopifyHmac`, `verifyWooHmac`)
  - parsing des payloads Shopify / Woo (`service.js`, `parseShopify` / `parseWoo`)
  - idempotence (double webhook)
  - flux `convertirEnCommandeErp` (compte existant / nouveau / rollback)
- **Fixtures** : `backend/tests/fixtures/{shopify-order.json,woo-order.json}`
  — payloads réalistes extraits des docs Shopify Admin API 2024-01 et
  WooCommerce REST v3.

Passer en **Option A** (base `plume_test` réelle) :
1. créer un `.env.test` avec `DB_NAME=plume_test`
2. dans un `beforeAll`, exécuter `database/schema-v2/*.sql` sur la base de test
3. remplacer les `jest.unstable_mockModule(...)` par des insertions SQL réelles
   (site Shopify + site Woo avec `webhook_secret_hmac` connu, cf. `sites/service.js#encryptPayload`)
4. `afterAll` : `TRUNCATE sites_ecommerce, commandes_web, comptes_web_b2b RESTART IDENTITY CASCADE`

## TODOs identifiés

- **Rate limiting webhooks** : `server.js` monte `express-rate-limit` globalement,
  mais aucun limiter spécifique n'est appliqué aux routes
  `/webhook/:site_code` et `/webhook-woo/:site_code`. Ajouter un limiter
  dédié (ex : 60 req/min/IP) puis rendre l'assertion `expect(gotAny429).toBe(true)`
  stricte dans la suite webhooks (section « Rate limiting / anti-DoS »).
- **Statut rollback** : le brief attend `statut_web = 'reçue'` en cas d'échec
  de conversion, la logique actuelle du service passe à `'erreur'`.
  Décider laquelle est la source de vérité et aligner (le test accepte
  actuellement les deux valeurs).
