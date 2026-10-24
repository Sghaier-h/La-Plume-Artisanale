# Phase C — RH étendu + Interfaces tablettes

Branche : `feature/backend-catalogue-dashboards-deploy`
Scope : `docs/domain.md` §11bis + §14quater.5-7 + §14quater.14

## Livraisons

### 1. SQL

- `database/schema-v2/36_rh_etendu.sql` (250 lignes, idempotent) :
  - Enrichissement `employes` : `solde_courant`, `date_dernier_mouvement`,
    `rib_bancaire`, `caisse_defaut_paiement_salaire`.
  - Tables nouvelles : `comptes_employes_mouvements`, `avances_salaires`,
    `ajustements_comptes_rh` (code auto `AJ-{NOM}-{YYYY}-{NN}`),
    `compensations_rh`, `code_pin_employe`, `demandes_rh`,
    `planning_employes`, `pointages_evenements`.

### 2. Seeds

Dossier `backend/seeds/rh-etendu/` + script `backend/scripts/seed-rh-etendu.js`
(npm scripts `seed:rh-etendu` et `seed:rh-etendu:dry`) :

- `00_schema.sql` autonome.
- `01_comptes_employes.sql` : 12 employés démo (Salem, Amdouni…) + RIB.
- `02_avances.sql` : 8 avances démo (demande, approuvée, payée, soldée).
- `03_ajustements.sql` : 3 ajustements (ex. `AJ-SALEM-2026-07`).
- `04_compensations_rh.sql` : 5 compensations CNSS/IRPP (ex. Najwa Amdouni
  4764,133 DT).
- `05_mouvements_comptes.sql` : historique varié par employé.
- `06_code_pin.sql`, `07_demandes_rh.sql`, `08_planning_employes.sql`.

Tous idempotents (`DELETE WHERE LIKE '[DEMO]%'`, `ON CONFLICT DO UPDATE`).

### 3. Backend modules v2

Sous `backend/modules-v2/rh/` (model/service/controller/routes/manifest, ESM) :

- `comptes-employes/` : `GET /`, `GET /kpi`, `GET /:id/solde`,
  `GET /:id/mouvements`, `PUT /:id`, `POST /:id/mouvement`.
- `avances/` : CRUD + `POST /:id/approuver|refuser|payer|rembourser`.
  Chaque action transactionnelle qui modifie le solde employé.
- `ajustements/` : CRUD + `POST /:id/valider|rejeter`. Code auto, double
  validation (createur ≠ validateur).
- `compensations-rh/` : CRUD + `POST /:id/appliquer|annuler`.
- `pin-tablette/` : CRUD + `POST /authenticate` (public, renvoie token
  tablette HMAC 30 min). Blocage automatique après 3 échecs.
- `demandes-rh/` : CRUD + `POST /:id/traiter`.
- `planning-employes/` : CRUD + `GET /mon/:idEmploye`.

Enregistrés dans `backend/modules-v2/index.js`. Nouveau `POST
/api/v2/rh/pointages/evenements` pour entrée/sortie/pauses tablette.

### 4. Frontend pages RH (ADMIN · RH_MANAGER)

Toutes utilisent `DashboardShell` + `KpiCard` + `SectionCard`, palette CSS
vars, Fraunces italic + Inter + JetBrains Mono, grids
`repeat(auto-fit, minmax(220px, 1fr))`, `clamp()` partout (contrat
§14ter.17b responsive 400 px → 1920 px) :

- `pages/rh/ComptesEmployes.tsx` + `CompteEmployeDetails.tsx` (onglets).
- `pages/rh/AvancesSalaires.tsx` (wizard + workflow 4 étapes).
- `pages/rh/AjustementsComptesRh.tsx` (double validation).
- `pages/rh/CompensationsRh.tsx`.

Routes `/rh/comptes-employes`, `/rh/avances`, `/rh/ajustements`,
`/rh/compensations` protégées `[ADMIN, RH_MANAGER]`. Breadcrumbs mappings
ajoutés dans `components/Breadcrumbs.tsx`.

### 5. 4 interfaces tablettes kiosque strict §14quater.14

- `TablettePointeuseRH` `/tablette/pointeuse` : clavier PIN XL →
  hub icônes Entrée/Sortie/Pause début/Pause fin, photo auto webcam
  (preuve), confirmation 2 s check vert, horloge temps réel.
- `TabletteDemandeAvance` `/tablette/demande-avance` : PIN → formulaire
  montant + motif liste prédéfinie + signature tactile canvas → POST
  demande RH + avance liée.
- `TabletteConsultationSoldeEmploye` `/tablette/mon-compte` : PIN → 3
  écrans ATM (solde / dernier bulletin / historique 5 derniers), navigation
  précédent/suivant, pas de bouton action.
- `TabletteMesDemandes` `/tablette/mes-demandes` : PIN → hub d'icônes
  §14ter.17c (6 tuiles) + section alertes RH haute + sous-pages compactes.

Composants partagés : `components/rh/PinKeypad.tsx` (3×4 grid responsive
60-120 px) et `components/rh/TabletteKiosqueShell.tsx` (header kiosque
strict, aucune UserBar).

### 6. Kiosque strict §14quater.14

- `ProtectedRoute.tsx` : `TABLETTE_ROLES` étendu à `CAISSIER`. Les routes
  `/tablette/*` restent **publiques** (pas de JWT applicatif) — identifiées
  par le PIN tablette.
- Nouveau rôle `CAISSIER` ajouté dans `backend/src/config/dev-users.js`
  (`caissier@entreprise.local`, dashboard `caissier`).

### Vérifications

- `tsc --noEmit` exit 0 (lucide-react `HandCoins` → `Coins`, caractères `>`
  JSX échappés dans Phase A compta + fix typing `TypeActiviteST` dans
  Phase B sous-traitants).
- Seeds idempotents.
- Aucun git commit effectué.

### Notes croisées

- Un autre agent (Phase A compta) a introduit `documents_archive` /
  `documents_liaisons` — les demandes RH y pointent déjà via
  `demandes_rh.id_document_archive`. Les signatures tactiles restent en
  SVG direct dans `demandes_rh.signature_svg` comme demandé.
- Les tablettes publiques utilisent `POST /api/v2/rh/pin-tablette/authenticate`
  qui renvoie un token court HMAC + l'employé.
