# Phase E2 — Apport gérant · Édition ADMIN tracée · Session timeout

Rapport synthétique (<500 mots) couvrant l'implémentation de §14quater.6,
§14quater.8-9 et §14quater.10.

## 1. Schéma SQL — `database/schema-v2/39_apport_gerant_et_admin.sql`

Trois tables + une vue (idempotent, préserve toutes les tables Phase A) :

- `comptes_courants_associes` : un CCA par gérant × société (`id_user_gerant`,
  `id_societe`, `libelle`, `solde`, `actif`, timestamps). Contrainte d'unicité
  `(gerant, societe)`.
- `apports_gerant_mouvements` : journal des apports/retraits.
  Colonnes clés : `id_cca`, `montant > 0`, `type_mvt ∈ {apport,retrait}`,
  `mode_paiement ∈ {espece,cheque,virement}`, `id_caisse_destination`,
  `id_mouvement_caisse` (lien vers `mouvements_caisse`), `id_document_archive`
  (justificatif), `reference`, `saisi_par`.
- `historique_editions_admin` : audit intégral §14quater.8-9.
  `type_doc ∈ {devis, commande, facture, avoir, bl}`, `id_doc`, `id_admin`,
  `date_edition`, `raison` (texte obligatoire), `avant_jsonb`, `apres_jsonb`,
  `diff_resume`, `ip_address`, `user_agent`.
- Index sur toutes les FK, GIN sur `apres_jsonb`.
- Vue `v_cca_soldes` : solde recalculé en live + solde stocké + nb mouvements.

L'apport gérant alimente simplement `mouvements_caisse` avec
`type_mouvement='apport_gerant'` : les tables Phase A sont intactes.

## 2. Backend v2

### `modules-v2/comptabilite/apport-gerant/`
Module complet `{model, service, controller, routes}.js`. Routes
(toutes gated `authenticate` + `requireAdmin` + permission `account.cash.*`) :
- `POST /api/v2/comptabilite/apport-gerant/saisir`
- `GET  /api/v2/comptabilite/apport-gerant/historique`
- `GET  /api/v2/comptabilite/apport-gerant/solde-cca`

Transaction atomique : (1) upsert CCA, (2) insert `mouvements_caisse` avec
`sens=entree/sortie`, `type_mouvement='apport_gerant'`, (3) insert
`apports_gerant_mouvements`, (4) `UPDATE solde ± montant`.

Enregistré dans `modules-v2/index.js` sous le groupe `comptabilite`.

### `modules-v2/_shared/admin-edit-guard.js`
- `requireAdmin(req,res,next)` : bloque les non-ADMIN.
- `wrapAdminEdit(controller, docType)` :
  1. Lit le snapshot avant via `SELECT * FROM {devis|commandes|factures|avoirs|bons_livraison}`.
  2. Si `statut != brouillon` et non-ADMIN → 403.
  3. Si `statut != brouillon` et ADMIN sans `raison_edition_admin` → 400.
  4. Retire `raison_edition_admin` du body avant d'appeler le controller.
  5. Intercepte `res.json` : si succès et édition d'un doc validé, logge
     `avant/apres/diff_resume/ip/ua` dans `historique_editions_admin`
     (fire-and-forget, non bloquant).

Appliqué sur les PUT :
- `backend/modules-v2/ventes/devis/legacy-routes.js`
- `backend/modules-v2/ventes/commandes/legacy-routes.js`
- `backend/modules-v2/ventes/factures/legacy-routes.js`
- `backend/modules-v2/ventes/avoirs/legacy-routes.js`

## 3. Frontend

### `components/SessionTimeoutManager.tsx` (§14quater.10)
Hook `useIdleTimeout` : écoute `mousemove/mousedown/keydown/click/scroll/touchstart`
(debounce 500 ms) + intercepteurs axios request/response. Après 14 min idle →
modal avec `countdown 60s` + boutons « Rester connecté » (reset timer) et
« Se déconnecter ». Après 15 min idle → `localStorage.clear` + redirect
`/login`. Exclut automatiquement `/login`, `/portail/login`, `/tv/*`,
`/tablette/*`. Monté dans `AppContent` entre `TaskNotification` et `Routes`.

### `components/AdminEditReasonModal.tsx` + `hooks/useAdminEdit.tsx`
Modal affiché quand `role === 'ADMIN'` ET `statut !== 'brouillon'`. Impose
une raison ≥ 5 caractères. Le hook `useAdminEdit(docType, {statut, docLabel})`
expose `{isAdmin, draft, needsReason, canEdit, requestReason, Modal}`. Les
pages Devis/Commandes/Facture/Avoir utilisent `requestReason(action)` qui
injecte `raison_edition_admin` dans le payload PUT.

### `pages/comptabilite/ApportGerant.tsx`
Route `/comptabilite/apport-gerant` (ADMIN seul). KPI solde CCA +
formulaire saisie (type, mode, montant, caisse, référence, libellé,
justificatif upload vers `documents_archive`, notes) + historique
chronologique. Breadcrumb ajouté dans `Breadcrumbs.tsx`.

## 4. Vérification

- `tsc --noEmit` → **exit 0** (confirmé).
- Session timeout : modal à 14 min, logout à 15 min (couverture par
  `idleMs=14*60e3`, `warningMs=60e3`, debounce 500 ms).
- Préservation des tables Phase A : vérifié dans le SQL (aucun `DROP`,
  tout `IF NOT EXISTS`, apport = `mouvements_caisse.type_mouvement='apport_gerant'`).
