# Phase B — Sous-traitants étendus par type d'activité

Référence : `docs/domain.md` §7.11 (bons sortie/retour persistants) + §14quater.3.

## Livrables

### 1. Schéma SQL `database/schema-v2/35_sous_traitants_etendus.sql`

- Enrichit `sous_traitants` : `type_activite` (enum métier Tunisie textile),
  `activites_secondaires[]`, `tarif_unitaire + unite_facturation`,
  `qualite_moyenne_pct`, `date_debut_relation / date_fin_relation`,
  `siret_matricule_fiscal`, `rib_bancaire / banque`, `conditions_paiement`,
  `caisse_defaut_paiement`, `identification`.
- Nouvelles tables : `comptes_sous_traitants` (solde initial / courant /
  reset §14quater.9), `comptes_sous_traitants_mouvements`
  (creance / paiement / ajustement / compensation), `travaux_sous_traitants`
  (statut en_cours → termine → valide → paye ou refuse) et
  `anomalies_sous_traitant` (filet de sécurité §14bis.4, gravité
  info/a_corriger/critique/corrige_auto).
- `of_sous_traitance` enrichi : `signature_sortie_svg`,
  `signature_recepteur_svg`, `signature_retour_svg`, `date_livraison_prevue`,
  `instructions_speciales`, `quantite_rejetee`, `motif_rejet`,
  `controle_qualite JSONB`, `controle_par`, `date_controle`.
- Vue `v_sous_traitants_par_type` + trigger
  `fn_cst_update_solde` (synchronisation automatique solde_courant).

### 2. Seeds réalistes `backend/seeds/sous-traitants/`

15 sous-traitants réels anonymisés tirés de
`Compte Sous-Traitant 2024-2025.xlsx` et `Détails Sous Traitance 2026.xlsx` :
Chokri Haddad (ourdissage), Salem Mehdi (nouage), Sobolux (teinture),
Adel Chakroun (couture+frange), Neji Sghaier (couture), Najwa Amdouni
(broderie), Ste Mose de Commerce (personnalisation), Lotfi Bahri, Leyla
Khlifa, Hatem Ben Abid, Ali Sassi, Samira (franges BANEN/SAYADA/KSIBA),
Dimatex (finition), Ali Thabet (personnalisation+broderie), Bent Aissa
(couture gros volumes). Soldes réels adaptés, 50 travaux variés 6 mois,
8 bons sortie/retour avec signatures SVG mock, 10 anomalies démo
(dont lots oubliés chez Ali Sassi / Samira).

Script : `backend/scripts/seed-sous-traitants.js` + npm
`seed:sous-traitants[:dry]`.

### 3. Backend modules-v2 `backend/modules-v2/sous-traitance/`

4 sous-modules ajoutés et montés dans `index.js` :

| Mod | Base URL | Endpoints clés |
|---|---|---|
| `sous-traitants` | `/api/v2/sous-traitance/sous-traitants` | CRUD, `/:id/compte`, `/:id/travaux`, `/:id/bons`, `/stats`, `/anomalies[,:id/resolve]` |
| `travaux`        | `/api/v2/sous-traitance/travaux`         | CRUD + `/:id/valider`, `/:id/refuser`, `/:id/payer`, `/stats`, `/par-mois` |
| `bons`           | `/api/v2/sous-traitance/bons`            | GET list/detail + `/:id/signer` (sortie / recepteur / retour), `/:id/controle` |
| `comptes`        | `/api/v2/sous-traitance/comptes`         | GET list/detail/mouvements + POST `ajustement/compensation/paiement/creance` |

Permissions : rôle `MAGASINIER_SOUSTRAITANTS` enrichi
(`travail_soustraitant:*`, `compte_soustraitant:*`,
`anomalie_soustraitant:gerer`).

### 4. Frontend `frontend/src/pages/sous-traitants/`

- `SoustraitantsListe` — liste + filtre `type_activite` + 4 KPI
  (actifs, créances, travaux en cours, anomalies).
- `SoustraitantDetails` — 6 onglets (Infos / Travaux / Bons sortie / Bons
  retour / Compte / Paiements) + dynamicCrumb.
- `SoustraitantForm` — wizard 3 étapes (Identité / Activité+Tarifs /
  Conditions).
- `TravauxSoustraitantsListe` — journal filtré statut/type/période +
  actions Valider / Refuser (modal) / Payer.
- `BonSortieST` + `BonRetourST` — fiches avec composant tactile
  `SignatureCanvas` SVG réutilisable + contrôle qualité express
  (cases couture / teinture / dimension / autre + photo URL).
- `DashboardSousTraitants` — pattern hub + alertes §14ter.17c
  (alertes top, grille d'icônes 6 actions, KPI synthétiques,
  perf par type, mini-graphe mensuel).

### 5. Mode tablette atelier `pages/TabletteSousTraitant.tsx`

Hub tactile grand format (boutons ≥ 72 px) avec 6 modes : Scan QR,
Nouveau bon sortie, Retour marchandise (contrôle qualité express +
signature), Mon planning, Mon compte + alertes litige/retard/anomalies.
Route `/tablette/sous-traitant`.

### 6. Service frontend `services/soustraitanceApi.ts`

Client typed complet (SousTraitant, TravailST, BonST, CompteSousTraitant,
MouvementCompteST, AnomalieST, ControleQualiteExpress + helpers
`fmtMoney/fmtDate/fmtInt` + mappings `TYPE_ACTIVITE_LABEL / TONE`).
Zero mock — toutes les pages consomment ce service.

### 7. Navigation + Breadcrumbs

NavigationTopBar menu `Fabrication` : ajout des 3 sous-items *Sous-traitants
par type · Travaux ST · Dashboard ST*. Breadcrumbs enrichis.

## Vérifications

- `tsc --noEmit` exit **0**.
- Seeds idempotents (ON CONFLICT, WHERE NOT EXISTS, DELETE+INSERT scoped).
- Documents attachés : NON créée de table propriétaire ; les bons scannés
  seront liés via la table centrale `documents_archive` fournie par la
  Phase A (schema 37). Signatures restent SVG direct colonne (donnée métier).
- Responsive strict : grids `auto-fit minmax`, boutons `minHeight 44px`
  (72 px tablette), tableaux dans `overflow-x: auto`.

## Non-livré volontairement

- Signature intégration PDF (hors scope Phase B).
- Hub frontend « documents_archive » : couplé à Phase A.
- Statistiques avancées perf (délai moyen aller/retour) : stubs présents
  dans `travauxApi.stats` / `par-mois`, calculs plus fins Phase C.

Pas de git commit effectué.
