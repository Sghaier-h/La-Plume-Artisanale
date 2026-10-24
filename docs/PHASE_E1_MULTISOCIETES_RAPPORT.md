# Phase E1 — Multi-sociétés étendues (§14quater.1)

Date : 2026-10-24 · Branche : `feature/backend-catalogue-dashboards-deploy`

## Contrat couvert

`docs/domain.md §14quater.1` — 5 entités du groupe :

| Code | Raison sociale | Type |
|---|---|---|
| LP | La Plume Artisanale | fabrication (société principale) |
| CAPSCOR | CAPSCOR | import_export |
| AT | Artisanat Tunisien | commerce |
| PMG | PMG TEX TUNISIE | tissage |
| HS | Hamdi Sghaier | perso (gérant) |

## 1. Schéma DB — `database/schema-v2/38_multi_societes.sql`

- Crée (ou complète) la table `societes` avec les champs demandés : `code_societe`, `raison_sociale`, `siret`, `adresse`, `logo_url`, `tva_intracommunautaire`, `type_societe`, `est_consolidation`, `actif`.
- Ajoute `users.societe_courante INT REFERENCES societes(id_societe)` pour la dernière société choisie par l'utilisateur.
- Crée `users_societes_acces (id_user, id_societe, role_societe, societe_par_defaut)` pour l'ACL. **Back-compat** : si un user n'a aucune ligne, il voit toutes les sociétés actives (comportement actuel préservé).
- Ajoute `id_societe INT NOT NULL DEFAULT 1 REFERENCES societes(id_societe) ON DELETE RESTRICT` sur `comptes`, `commandes`, `factures`, `devis`, `avoirs`, `bons_livraison`, `ordres_fabrication`, `employes`, `bons_sous_traitance_envoi` (via DO block qui saute les tables inexistantes). Index `idx_<table>_societe` sur chacune. DEFAULT 1 = LP → back-compat.
- Crée `v_consolide_ventes` : agrégation par société + ligne synthèse (`code_societe='ALL'`, `id_societe=0`) utilisée par le dashboard admin.

## 2. Backend module v2 — `backend/modules-v2/multi-societes/`

Fichiers : `manifest.js`, `model.js`, `service.js`, `controller.js`, `routes.js`. Monté sur **`/api/v2/societes`** via un alias de groupe ajouté dans `backend/modules-v2/index.js` (`groupSlug['multi-societes'] = 'societes'`).

Routes :

- `GET /api/v2/societes` — liste visible (ADMIN voit tout, autres filtrés via `users_societes_acces`, back-compat si vide).
- `GET /api/v2/societes/:id` — détail.
- `PUT /api/v2/societes/:id` — édition (`requirePermission('societes:modifier')`, ADMIN bypass).
- `POST /api/v2/societes/:id/basculer` — met à jour `users.societe_courante` et renvoie un token JWT raf portant le claim `societe_id`.
- `GET /api/v2/societes/consolide/ventes` — vue consolidée (ADMIN seul).

Middleware partagé : `backend/modules-v2/_shared/societe-context.js` lit l'en-tête `x-societe-id` (ou `req.user.societe_courante`) et expose `req.societeId` / `req.societeConsolide`. Valeur spéciale `ALL` → consolidé. Helper SQL `withSociete()` fourni pour injecter le filtre.

## 3. Seed — `backend/seeds/multi-societes/01_societes.js` + `scripts/seed-societes.js`

- Idempotent (`ON CONFLICT (code_societe) DO UPDATE`).
- Scripts npm :
  - `npm run seed:societes` — exécute.
  - `npm run seed:societes:dry` — prévisualise sans écrire (**testé OK**).

## 4. Frontend

- Nouveau contexte `frontend/src/contexts/SocieteContext.tsx` : expose `{ societe, setSociete, societes, isConsolide, setConsolide, loading, error, reloadSocietes }`, pose un intercepteur axios qui injecte `x-societe-id` sur toutes les requêtes (ou `ALL` en mode consolidé), persiste dans `localStorage.laplume_societe_active` + `laplume_societe_consolide`.
- `SocieteProvider` ajouté dans `App.tsx` entre `<Router>` et `<AppProvider>`.
- `CompanySwitcher.tsx` entièrement réécrit : dropdown dans la UserBar avec logo + raison sociale, option **"Vue consolidée (admin)"** visible uniquement si `role === ADMIN`. Le changement appelle `POST /api/v2/societes/:id/basculer` et remplace le token local.
- `services/api.ts` : nouveau `societesV2Service` (list/get/update/basculer/consolideVentes) ; le `multisocieteService` legacy est préservé pour les flux établissements/transferts.
- Page `MultiSociete.tsx` : branchée sur v2 en priorité, fallback legacy si indisponible.

## 5. Vérifications

- `node scripts/seed-societes.js --dry` → affiche les 5 entrées (OK).
- `node --check` sur tous les fichiers backend créés → OK.
- `import()` dynamique des routes v2 → `default` est un router Express (OK).
- `npx tsc --noEmit` sur `frontend/` → **exit 0**.

## 6. Script de test manuel

`backend/scripts/test-societes-v2.sh` — curl des 4 endpoints (`TOKEN=... ./scripts/test-societes-v2.sh`).

## Contraintes respectées

- Aucun git commit.
- 5 entités du contrat lignes 2970-2985 préservées (en réalité §14quater.1 lignes ~4464-4477).
- Back-compat : `id_societe` DEFAULT 1 = LP, et absence d'ACL = accès à tout.
- Legacy `backend/modules/multisociete/` **non touché**.
