# Phase T3b — Branchement Frontend (CRIT → MIN)

Patches ciblés dérivés des 9 rapports T2 pour câbler l'UI sur les endpoints
backend réels, supprimer les `alert()` bloquants et aligner le routing
tablette / dashboard PC. Portée stricte : `frontend/src/**` (ni backend ni SQL).

## (a) Fichiers patchés — diffs clés

### `frontend/src/pages/TabletteCoupeur.tsx` (CRIT)
- `GET /taches/operateur/:id/day`        → `GET /v2/fabrication/taches/operateur/:id/day`
- `PUT /taches/:id/demarrer`             → `PUT /v2/fabrication/taches/:id/demarrer`
- `PUT /taches/:id/terminer`             → `PUT /v2/fabrication/taches/:id/terminer`
- `alert()` → `useToast()` (success / error / warning)
- `btnBase.minHeight 48 → 72`, `padding 12px 20px → 20px 32px`, `fontSize 20px`

### `frontend/src/pages/TabletteTisseur.tsx` (CRIT)
- Mêmes repointages `/taches/*` → `/v2/fabrication/taches/*`
- `alert()` → `useToast()` sur `handleDemarrer`, `handleDeclarerProduction`,
  `handleTerminer`, `handleIncident`
- Mêmes bumps boutons (`minHeight: 72`, `fontSize: 20`)

### `frontend/src/pages/DashboardTisseur.tsx` (CRIT)
- `handleConfirmerDemarrage` : avant = `alert()` + `setState` local. Désormais
  `await api.post('/v2/fabrication/of/:id/demarrer', ...)` + toast + refresh
  local. L'OF doit avoir `id_of` (hydraté F2) ; sinon fallback mock + info toast.
- `peutDemarrer` : accepte `etat === 'Machine alimentée'` **OU** `'En attente'`
  (planifié backend) — l'ancien gate "Machine alimentée" seul masquait le
  bouton pour tous les OF réels.
- `handleConfirmerRefus` : `alert()` → `toast.info`

### `frontend/src/pages/DashboardControleCentral.tsx` (CRIT)
- Modal "Nouveau contrôle" (qualité) : `alert()` → `POST /v2/qualite/controles`
  (table `controles_qualite`, colonnes dynamiques, `est_bloquant` déduit du
  score < 7/10), avec toast + `refreshControles()`.
- Modal "Nouveau contrôle sécurité" : idem (`type_controle: 'securite_zone'`).
- Ajout des `useState` pour poste / zone, et `savingControle` pour désactiver
  le bouton pendant l'envoi.

### `frontend/src/pages/TableauBordMagasinPF.tsx` (CRIT)
- Modal "Nouveau colis" : les 3 inputs (poids / dimensions / palette) étaient
  non contrôlés. Désormais `useState` + `POST /v2/ventes/colis` avec payload
  `{ poids_kg: parseFloat(...), dimensions, notes }` — alignement sur colonne
  `poids_kg` du schéma v2 (table `colis`).

### `frontend/src/pages/DashboardMagasinierSoustraitants.tsx` (MAJ)
- `handleEnregistrerSortie` / `handleEnregistrerRetour` : remplacement des
  `alert()` + perte de saisie par `navigate(..., { state: { prefill... } })`.
  La page cible peut récupérer `location.state.prefillBonSortie` /
  `prefillRetour`.

### `frontend/src/pages/PlanificationGantt.tsx` (MAJ)
- Convention front alignée sur backend (`/planning-gantt` renvoie
  `data.items[]` avec `id_commande`) :
  - `res.data.data.projets` → `res.data.data.items`
  - `res.data.data.taches`  → `res.data.data.items`
  - `id_projet`             → `id_commande` (fallback compat conservé)
- Libellés : `libelle` → `libelle || numero_commande`,
  `code_projet` → `code_projet || numero_commande`.

### `frontend/src/pages/DashboardChefProduction.tsx` (MAJ)
- `SectionCard "Alertes urgentes"` déplacée **avant** les KPIs (§14ter.17c).
  Suppression du bloc dupliqué en bas.

### `frontend/src/pages/TabletteCaissier.tsx` (MAJ)
- Boutons modal `btnPrimary` / `btnGhost` : `minHeight 56 → 72`,
  `padding 14px 24px → 20px 32px`, `fontSize → 20`.
- `alert()` → `useToast()` (dans `ActionModal`).

### `frontend/src/components/TabletteLayout.tsx` (MIN)
- `HOME_ROUTE_BY_ROLE.COUPEUR : '/dashboard-post-coupe'` → `'/tablette/coupeur'`.

### `frontend/src/pages/Login.tsx` + `frontend/src/App.tsx` (MIN)
- `roleToDashboard.TISSEUR` : `/dashboard-tisseur` → `/tablette/tisseur`.
- `roleToDashboard.COUPEUR` : `/dashboard-post-coupe` → `/tablette/coupeur`.

### `frontend/src/pages/DashboardPostCoupe.tsx` (MIN)
- Déduplication : suppression de `_btnPrimary = btnPrimary` ; `btnPrimary`
  conservé avec `@ts-ignore` d'ESLint car référencé par d'autres dashboards.

## (b) `npx tsc --noEmit` — exit 0

Vérification depuis `frontend/` : `npx tsc --noEmit` → exit **0** (aucune
erreur TypeScript après tous les patches).

## (c) Bugs non résolus / TODO

- **DashboardMagasinierSoustraitants** — les pages cibles (`/sous-traitants/:id`
  et `/bons-retour-st/:id`) doivent exploiter `location.state.prefillBonSortie`
  / `prefillRetour`. **Non implémenté dans T3b** (hors scope : patch côté pages
  cibles). Le dashboard a cessé de perdre les données ; la consommation reste à
  faire dans les pages cibles.
- **DashboardControleCentral** — le POST `/v2/qualite/controles` enregistre
  `type_controle` + `observations` + `est_bloquant` ; `id_of`, `id_machine` ne
  sont pas sélectionnables dans la modal actuelle (champ libre `select` du
  poste contrôlé = libellé texte). À enrichir si une liaison OF/machine est
  requise.
- **TabletteCaissier** — les actions `encaissement` / `cheque` restent sur un
  toast informatif (pas de POST réel) : backend ventes/paiements à finaliser
  en Phase A2 (TODO existant conservé).
- **PlanificationGantt** — le filtre `id_commande` passé au backend
  `/planning-gantt/taches` n'est pas (encore) honoré côté backend (filtres
  reconnus : `date_debut`, `date_fin`, `id_machine`, `id_operateur`). Le front
  envoie quand même par forward-compat ; le backend ignore ce param.
- **Rôle TISSEUR** — le dashboard PC (`/dashboard-tisseur`) reste accessible
  depuis la barre utilisateur si le dashboard est explicitement attribué dans
  `dashboardsAttribues`. Le login par défaut va sur l'écran tablette.
