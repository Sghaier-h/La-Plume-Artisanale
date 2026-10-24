# Phase A — Comptabilité étendue · Rapport d'implémentation

Branche : `feature/backend-catalogue-dashboards-deploy`
Contrat couvert : `docs/domain.md` §14quater + §9.9 + §14quater.17b (responsive)
TypeScript : `cd frontend && npx tsc --noEmit` → exit **0**

## Livrables

### 1. Schémas SQL (idempotents)
- `database/schema-v2/34_comptabilite_etendue.sql`
  Étend `caisses` (type_caisse, ordre, updated_at) et `mouvements_caisse`
  (type_mvt, mode_paiement, id_piece_liee, piece_type, cree_par) ; vue
  `caisses_mouvements`. Nouvelles tables : `routage_caisse_par_mode`,
  `dossiers_import` + `_lignes` + `_frais`, `cessions_intragroupe` (clé
  d'idempotence sur `cle_unique`), `depenses_bloc_comptabilise`,
  `compensations_croisees` + `compensations_lignes` avec trigger
  `fn_check_compensation_balance` (CHECK balance débit=crédit),
  `rapprochement_bancaire_imports` + `_lignes`. Index + CHECK partout.
- `database/schema-v2/37_documents_archive.sql`
  Archive **centrale polymorphique** (remplace l'idée `pieces_jointes_compta`) :
  `documents_archive` (OCR, tsvector, checksum SHA-256 pour dédup,
  versions, signature SVG, confidentialité, RGPD) + table de liaison
  `documents_liaisons` (entite_type/entite_id, role_liaison). Trigger
  full-text sur titre+description+ocr_text+tags.

### 2. Seeds démo (idempotents, dossier `backend/seeds/comptabilite-etendue/`)
- `01_caisses.sql` — 4 caisses La Plume + routage 7 modes de paiement
- `02_dossiers_import.sql` — 3 imports réalistes (coton Chine, jacquard
  Italie, colorants Allemagne) avec lignes et frais annexes détaillés
- `03_cessions.sql` — 2 cessions LP→CAPSCOR (statuts calculée/facturée)
- `04_depenses_especes.sql` — 15 dépenses octobre 2026 (café ouvriers,
  dépannage, carburant, parking, timbres…), 1 avec signature > 50 DT
- `05_compensations.sql` — CNSS Najwa 4764 DT + solde fournisseur Como ↔
  créance CAPSCOR (chaque compensation = 2 lignes débit/crédit)
- `06_rapprochement.sql` — relevé BIAT démo (10 lignes mixtes rapprochées/
  suggérées/non-matchées)

Script `backend/scripts/seed-compta.js` + npm scripts `seed:compta` /
`seed:compta:dry` qui exécutent schémas 34+37 puis les seeds.
*Note :* lecture des Excel réels bloquée par le classificateur PII — j'ai
utilisé les libellés métier déjà présents dans le contrat (CNSS Najwa 4764
DT, imports Chine/Italie/Allemagne, catégories dépenses Tunisie).

### 3. Backend modules-v2
Nouveaux : `comptabilite/{caisses, dossiers-import, cessions,
depenses-especes, compensations, rapprochement}` + `documents/archive`.
Chaque sous-module expose `routes.js` + `controller.js` + `service.js` +
`model.js`, utilise `authenticate` + `requirePermission()` et le pool
`_shared/db.js`. Montage automatique via `modules-v2/index.js` (groupe
étendu). Les endpoints clés :
- `GET /api/v2/comptabilite/caisses` (soldes calculés en live)
- `POST /api/v2/comptabilite/caisses/transfert` (atomique via
  `withTransaction`)
- `POST /api/v2/comptabilite/dossiers-import/:id/recalculer-cessions`
  (coût prorata/kg + génération idempotente des cessions)
- `POST /api/v2/comptabilite/depenses-especes/cloturer-mois/:periode`
  (verrouillage + agrégation en bloc OD)
- `POST /api/v2/comptabilite/compensations` (vérification balance=0 avant
  insert, double garantie trigger PostgreSQL)
- `POST /api/v2/comptabilite/rapprochement/:id_import_bq/matching-auto`
  (heuristique montant ±0.01 DT × date ±3 j, scores 85 %)
- `GET  /api/v2/documents/archive` (full-text tsvector + filtres)
- `POST /api/v2/documents/archive/attach` (liaison polymorphique)

### 4. Frontend
Pages créées sous `pages/comptabilite/` : `Caisses.tsx`,
`CaisseDetails.tsx`, `DossiersImport.tsx`, `DossierImportDetails.tsx` (5
onglets), `CessionsIntragroupe.tsx`, `DepensesEspeces.tsx`,
`CompensationsCroisees.tsx`, `RapprochementBancaire.tsx` (3 colonnes).
Page archive : `pages/documents/ArchiveDocuments.tsx`.
Kiosque tactile : `pages/TabletteCaissier.tsx` (hub 4 icônes +
Alertes + solde live + modal plein écran, signature SVG canvas
tactile pour dépenses > 50 DT, patron `hub + alertes` §14ter.17c).

Toutes les pages respectent le design system La Plume strict (Fraunces
italic + Inter + JetBrains Mono + palette CSS vars) et sont **responsive**
(§14ter.17b) : grilles `auto-fit minmax(220px, 1fr)`, `clamp()` sur
typographie, boutons ≥ 44×44, tableaux dans `overflow-x: auto`. Zéro mock
dans le code frontend — toutes les données viennent des services API.

Routes ajoutées dans `App.tsx` (protégées ADMIN+COMPTABLE) ;
`PRIVATE_TABLETTE_ROLES` étend `CAISSIER`. `NavigationTopBar` enrichie
avec 6 nouveaux items dans §7 Comptabilité + lien archive documents.
`Breadcrumbs` cartographiés.

### 5. Services frontend
`services/comptabiliteApi.ts` enrichi avec `caissesService`,
`dossiersImportService`, `cessionsService`, `depensesEspecesService`,
`compensationsService`, `rapprochementV2Service` + 12 types. Nouveau
`services/documentsArchiveApi.ts` pour l'archive centrale.

## Vérifications
- `cd frontend && npx tsc --noEmit` → **exit 0**
- Seeds SQL : `ON CONFLICT DO UPDATE/NOTHING` ou `DELETE+INSERT` partout.
- Pas de commit git (laissé à l'utilisateur).
