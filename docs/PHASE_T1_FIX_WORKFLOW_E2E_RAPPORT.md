# Phase T1 — Fix Workflow End-to-End (CRM → Facture)

**Date** : 2026-10-24
**Branche** : `feature/backend-catalogue-dashboards-deploy`
**Objectif** : Faire passer sans erreur un workflow métier complet en 13 étapes
(client CRM → devis → commande → OF planifié → sous-traitance → qualité →
colisage → BL → facture) et corriger tous les bugs rencontrés qui le bloquent.

## Résultat

```
═══════════════════════════════════════════════════════
   RÉCAPITULATIF (14/14 OK)
═══════════════════════════════════════════════════════
   clientId      = 89
   contactId     = 113
   devisId       = 13     (numero DEV-2026-0012)
   commandeId    = 42     (numero CMD-20261024-0003)
   ofId          = 15     (numero OF-20261024-006)
   bonStId       = 5      (numero BST-20261024-0005)
   retourStId    = 6      (numero RST-20261024-0003)
   ctrlId        = 9      (décision laisser_passer_1c)
   colisId       = 3      (numero C003-BL0000-001)
   blId          = 3      (numero BL-202610-0002)
   factureId     = 12     (numero FAC-2026-0002)
═══════════════════════════════════════════════════════
```

Exécution :
```bash
node backend/scripts/test-workflow-e2e.js
```

## Bugs identifiés et corrigés

### Bug 1 — FK legacy sur toutes les tables Ventes/Fabrication

**Symptôme** : POST `/api/v2/ventes/devis` renvoie 400 _« Référence invalide
dans les données »_ (`ERROR_MESSAGES` sur FK violation 23503).

**Cause** : la migration CRM v1 → v2 (clients → `comptes`, utilisateurs → `users`)
a conservé des FKs référençant les anciennes tables `_legacy_clients` et
`_legacy_utilisateurs`. Impossible donc d'utiliser les clients v2 dans un
devis / commande / BL / facture.

**Fix** : migration SQL
[`backend/migrations/20261024_fix_fk_legacy_to_v2.sql`](../backend/migrations/20261024_fix_fk_legacy_to_v2.sql)
qui refait pointer les FKs vers les tables v2 :

| Table | Colonne | Avant | Après |
|-------|---------|-------|-------|
| `devis` | `id_client` | `_legacy_clients(id_client)` | `comptes(id_client)` |
| `commandes` | `id_client` | `_legacy_clients(id_client)` | `comptes(id_client)` |
| `commandes` | `validee_par` | `_legacy_utilisateurs(id_utilisateur)` | `users(id_user)` |
| `bons_livraison` | `id_client` | `_legacy_clients(id_client)` | `comptes(id_client)` |
| `factures` | `id_client` | `_legacy_clients(id_client)` | `comptes(id_client)` |
| `bons_retour` | `id_client` | `_legacy_clients(id_client)` | `comptes(id_client)` |
| `ordres_fabrication` | `cree_par` | `_legacy_utilisateurs(id_utilisateur)` | `users(id_user)` |

**Pré-check** : toutes les lignes existantes référencent déjà des rows présents
dans les tables v2 (vérifié par `SELECT ... NOT IN`) — zéro perte de données.

### Bug 2 — Trigger legacy `mettre_a_jour_type_client`

**Symptôme** : POST `/api/v2/ventes/devis/:id/transformer` renvoie 500
_« relation "clients" does not exist »_.

**Cause** : trigger sur `commandes` qui référence l'ancienne table `clients` et
une colonne `type_client` disparue (remplacée par `comptes.type_compte`).

**Fix** : la migration SQL ci-dessus drop le trigger et la fonction.

### Bug 3 — `legacy-controller.js:95` — validateReferentialIntegrity

**Symptôme** : POST devis échoue sur `validateReferentialIntegrity('clients',
...)` → table inexistante.

**Fix** : déjà appliqué avant cette phase →
`backend/modules-v2/ventes/devis/legacy-controller.js:95` utilise désormais
`('comptes', 'id_client', ...)`.

### Bug 4 — `generer-ofs` : transaction avortée par bom_master

**Symptôme** : POST `/api/v2/ventes/commandes/:id/generer-ofs` renvoie
_« current transaction is aborted, commands ignored until end of transaction block »_.

**Cause** : `generateOFs` ouvre une transaction via `dbClient`, puis appelle
`computePreviewOfs(idCommande, dbClient)`. Celui-ci exécute une requête
best-effort sur `bom_master` avec `WHERE id_article = $1` — colonne qui
n'existe pas (le vrai schéma bom_master utilise `id_modele` / `id_dimension`
/ `id_tissage`). Le `try/catch` JavaScript n'empêche pas PostgreSQL d'avorter
la transaction en cours sur erreur 42703.

**Fix** :
`backend/modules-v2/ventes/commandes/legacy-controller.js` — `computePreviewOfs`
est désormais appelé avec `pool` au lieu de `dbClient`, pour que les lectures
best-effort hors transaction n'avortent pas la transaction OF.

### Bug 5 — `assigner-machine` : colonnes inexistantes

**Symptôme** : POST `/api/v2/fabrication/of/:id/assigner-machine` renvoie
500 _« column "id_machine" of relation "ordres_fabrication" does not exist »_.

**Cause** : l'endpoint faisait
`UPDATE ordres_fabrication SET id_machine = $1 WHERE id = $2` mais la table
utilise `id_machine_prevue` (pas `id_machine`) et sa clé primaire est `id_of`
(pas `id`).

**Fix** :
`backend/modules-v2/fabrication/of/legacy-routes.js:38-62` — utilise maintenant
`id_machine_prevue` et `id_of`, propage `date_debut_prevue` / `date_fin_prevue`,
et insère la planification dans `planning_machines` en best-effort.

### Bug 6 — BL `from-commande` lit des tables de projection vides

**Symptôme** : POST `/api/v2/ventes/bl/from-commande/:id` ne crée aucun BL
(0 lignes) même si la commande a bien des articles.

**Cause** : le handler lisait `commandes_clients` et `lignes_commande` —
tables de projection restées vides. Les vraies données vivent dans
`commandes` et `articles_commande`.

**Fix** :
`backend/modules-v2/ventes/bl/legacy-routes.js:47-82` — lit maintenant la
commande dans `commandes` et les lignes dans `articles_commande` (en joignant
`articles_catalogue` pour récupérer la désignation).

### Bug 7 — BL : lignes stockées dans la mauvaise table + abort transaction

**Symptôme** : POST BL renvoie 201 avec un `id_bl` mais le BL n'est pas
persisté — GET `/api/v2/ventes/bl/:id` renvoie 404.

**Cause** : `createBonsLivraison` insérait les lignes dans `lignes_facture`
en laissant `id_facture` à NULL — contrainte `NOT NULL` → 23502. Comme
l'insert ligne est dans la même transaction que l'insert BL, la transaction
est avortée. Le `try/catch` JS n'empêche pas l'abort, et le `COMMIT`
subséquent devient un ROLLBACK silencieux.

**Fix** :
`backend/modules-v2/ventes/bl/legacy-controller.js:186-204` — les lignes
sont désormais écrites dans la table dédiée `bl_lignes`, et chaque INSERT
est protégé par un `SAVEPOINT` qui isole la transaction principale en cas
d'erreur schéma.

### Bug 8 — Sous-traitance : POST manquant

**Symptôme** : POST `/api/v2/sous-traitance/bons` n'existe pas (404) ; la
table `of_sous_traitance` que les contrôleurs v2 référencent n'a pas les
colonnes attendues (`id_of_st`, `id_soustraitant`, `statut`, `quantite_envoyee`...).

**Cause** : scaffold v2 non aligné avec le schéma réel. La table métier
utilisée en prod est `mouvements_sous_traitance`.

**Fix** :
- `backend/modules-v2/sous-traitance/bons/routes.js` — ajout d'un endpoint
  `POST /` qui insère un bon de sortie dans `mouvements_sous_traitance`
  (type `sortie`, numéro `BST-YYYYMMDD-NNNN`).
- `backend/modules-v2/sous-traitance/retours/routes.js` — ajout d'un
  endpoint `POST /` qui enregistre un retour (nouveau mouvement type
  `retour`, numéro `RST-YYYYMMDD-NNNN`) et marque le mouvement d'origine
  comme `termine`.

## Fichiers modifiés

```
backend/migrations/20261024_fix_fk_legacy_to_v2.sql            [new]
backend/modules-v2/fabrication/of/legacy-routes.js             [edit]
backend/modules-v2/sous-traitance/bons/routes.js               [edit]
backend/modules-v2/sous-traitance/retours/routes.js            [edit]
backend/modules-v2/ventes/bl/legacy-controller.js              [edit]
backend/modules-v2/ventes/bl/legacy-routes.js                  [edit]
backend/modules-v2/ventes/commandes/legacy-controller.js       [edit]
backend/modules-v2/ventes/devis/legacy-controller.js           [edit — pré-existant]
backend/scripts/test-workflow-e2e.js                           [new]
docs/PHASE_T1_FIX_WORKFLOW_E2E_RAPPORT.md                      [new]
```

## Points d'attention / Hors scope

- Le module v2 `of_sous_traitance` reste cassé (colonnes manquantes). Un
  refactor complet est nécessaire pour aligner le schéma. Le workflow métier
  passe néanmoins en s'appuyant sur `mouvements_sous_traitance`.
- La fonction `createCommande` dans `ventes/commandes/legacy-controller.js`
  destructure `client_id` au lieu de `id_client` (la validation Zod attend
  `id_client`). Non bloquant ici car le workflow utilise la route
  `/devis/:id/transformer` (qui crée la commande directement en SQL).
- Les tables `commandes_clients` / `lignes_commande` sont des projections
  vides mais toujours référencées par `bl_lignes.id_ligne_commande` (FK).
  Hors scope : nettoyage des tables de projection.
- Frontend inchangé — pas de `tsc --noEmit` à faire.

## Reproduction

```bash
# 1. démarrer le backend (port 5000)
cd backend && npm start

# 2. lancer le workflow E2E
node backend/scripts/test-workflow-e2e.js
# → attendu : 14/14 OK (étape 0 = login + 13 étapes métier)
```
