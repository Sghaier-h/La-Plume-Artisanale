# Phase G2 — Formations + Entretiens RH & Courbe commerciale 12 mois

Suite directe de la Phase F2 (nettoyage mocks dashboards). Objectif : fermer les deux widgets encore sous mock dans `DashboardRHManager` (formations à venir + entretiens à réaliser) et dans `DashboardCommercial` (courbe CA 12 mois), avec schéma SQL + modules v2 + seeds idempotents + pages dédiées.

## (a) Schéma SQL créé

Fichier : `database/schema-v2/41_rh_formations_entretiens.sql` (idempotent, `CREATE TABLE IF NOT EXISTS` + `ALTER … ADD COLUMN IF NOT EXISTS` + triggers `updated_at`).

Trois tables, FKs indexées + index composés sur `id_societe` et dates :

- `formations` — `id_formation, titre, description, type (interne|externe|e-learning|habilitation), duree_heures, cout_tnd, formateur, organisme, date_debut, date_fin, statut (planifiee|en_cours|terminee|annulee), id_societe`.
- `formations_participants` — `(id_formation, id_employe)` UNIQUE, `statut (inscrit|present|absent|desiste)`, `note_satisfaction`, `attestation_url`.
- `entretiens_annuels` — `id_entretien, id_employe, id_evaluateur, date_entretien, type (annuel|probatoire|recadrage|depart), score_global, objectifs_atteints JSONB, objectifs_prochains JSONB, besoins_formation, statut (planifie|realise|valide), signature_svg, id_societe`.

## (b) Backend — 2 modules v2 RH + 1 endpoint ventes/stats

Montés dans `backend/modules-v2/index.js` (`rh.formations`, `rh.entretiens`, `ventes.stats`). Build local : `121 routes montées, 0 échouées`.

- `GET /api/v2/rh/formations/{kpi,par-mois,upcoming,budget-tfp}` + CRUD + `GET|POST|DELETE /:id/participants[/:pid]`. Le `kpi` renvoie total/planifiees/en_cours/terminees/annulees/cout_annee_tnd/heures_annee/total_participants.
- `GET /api/v2/rh/entretiens/{kpi,par-mois,upcoming,en-retard}` + CRUD. Le `kpi` ajoute `en_retard` (planifie + date passée), `a_venir_30j`, `score_moyen` (AVG filtré realise|valide).
- `GET /api/v2/ventes/stats/ca-12-mois?id_commercial=` — agrégation `factures` par `DATE_TRUNC('month', date_facture)` sur 12 mois glissants, retour `[{mois:'YYYY-MM', montant_ht, nb_factures, panier_moyen}]`. Try/catch → `[]` si la table ou colonne manque.

Services typés dans `frontend/src/services/api.ts` : `rhFormationsService` (incl. `getKpi/getUpcoming/getBudgetTfp`), `rhEntretiensService`, `ventesStatsService.getCA12Mois()`.

## (c) Frontend — 2 pages + 2 widgets patchés

- **Nouvelle page** `pages/rh/EntretiensAnnuels.tsx` : design system strict `DashboardShell > KpiCard + SectionCard`, 6 KPIs live (planifiés/réalisés/validés/en retard + score moyen + à venir 30j), 2 colonnes « Prochains » / « En retard », tableau historique. Route protégée `[ADMIN, RH_MANAGER]`.
- **Page existante** `pages/rh/Formations.tsx` conservée (CRUD + budget TFP). Elle consomme déjà `/v2/rh/formations` via `formationsService` ; les routes v2 nouvellement créées lui répondent désormais.
- **DashboardRHManager** : widgets « Formations à venir » et « Entretiens à réaliser » branchés sur `rhFormationsService.getUpcoming(5)` + `rhEntretiensService.getUpcoming(5)` ; chip « Heures formation » du bloc Repères mensuels alimenté par `rhFormationsService.getKpi().heures_annee`. Les deux cartes ont désormais un lien cliquable vers `/rh/formations` et `/rh/entretiens`.
- **DashboardCommercial** : la série `evolutionCA` (12 points) est remplie par `ventesStatsService.getCA12Mois()`. Formatage mois court français `Jan…Déc` déduit de `YYYY-MM`. Si l'endpoint renvoie `[]` → bloc d'état vide « Pas encore de ventes sur les 12 derniers mois. » (style var CSS, pas de barres factices). La ligne « Prévisions » Monte-Carlo est supprimée (plus de bruit mock).

Routes ajoutées dans `App.tsx` (`/rh/entretiens` protégée `[ADMIN, RH_MANAGER]`). Breadcrumbs enrichis (`Formations`, `Entretiens annuels`).

## (d) Seeds & scripts

- Dossier `backend/seeds/rh-formations-entretiens/` : `00_schema.sql` (schéma autonome) + `01_demo.js` (ESM, 5 formations `[DEMO]`, 15 participants, 10 entretiens dont 2 en retard, 3 réalisés, 2 validés). Idempotence : `DELETE … WHERE titre|besoins_formation LIKE '[DEMO]%'` avant chaque `INSERT`.
- Script `backend/scripts/seed-formations-entretiens.js` (dry run supporté). `npm run seed:rh-formations` et `seed:rh-formations:dry` ajoutés à `backend/package.json`.
- Dry-run vérifié localement : 1 SQL + 1 JS détectés.

## (e) Vérifications

- `cd frontend && npx tsc --noEmit` → **exit 0** (strict TS, pas de régression).
- Build dynamique de `backend/modules-v2/index.js` → **121 routes montées, 0 échouées** (incl. 3 nouvelles).
- Dry run `seed:rh-formations:dry` → ordre + contenu listés sans toucher la base.
- Zéro commit git créé (conforme à la contrainte Phase G2).
