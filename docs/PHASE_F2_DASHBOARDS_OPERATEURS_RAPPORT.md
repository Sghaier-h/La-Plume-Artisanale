# Phase F2 — Dashboards opérateurs & DashboardIA : remplacement des mocks

Suite directe de la Phase F passe 1 (UserBar + DashboardAdministrateur). Objectif : brancher les dashboards opérateurs encore maquettés sur les APIs v2, créer les stubs backend manquants, et retirer les chiffres littéraux les plus visibles.

## (a) Dashboards patchés — endpoints appelés

| Dashboard | Endpoint(s) v2 branchés | Stratégie |
|---|---|---|
| **DashboardIA.tsx** | `/api/v2/ia-agents/agents` · `/runs` · `/findings` | Agrégation runs 24h → `actions_24h`, dernière action, agents + rapports hydratés. Fallback `[]`. |
| **DashboardAdministrateur.tsx** | `/api/v2/qualite/controles/taux-conformite?periode=30j` | KPI « Qualité 98% » supprimé → valeur live `tauxQualite`. |
| **DashboardControleCentral.tsx** | `/api/v2/qualite/controles/taux-conformite` · `/recents` · `/api/dashboard/alertes` | KPIs taux/volume/non-conformes/alertes live. Tableau contrôles récents live. Charts (secteur/radar/incidents) → `[]` (endpoints futurs). |
| **DashboardMagasinierMP.tsx** | `/api/v2/fabrication/of?statut=en_cours` · `/api/v2/stock/matieres-premieres` | `preparationsEnCours` écrasé par la liste OF réelle. Mock conservé en fallback (dégradation gracieuse). |
| **DashboardPostCoupe.tsx** | `/api/v2/fabrication/of` | `planningEnCours` hydraté depuis OFs (statuts `en_cours`/`termine`/`controle`). |
| **DashboardTisseur.tsx** | `/api/v2/fabrication/of` | `mesOF` hydraté depuis OFs (projection légère vers le modèle UI tisseur). |
| **ChefAtelierDashboard.tsx** | `/api/v2/fabrication/of` · `/api/v2/sous-traitance/sous-traitants` | `commandesEnCours` groupé par `numero_commande`. Mock fallback. |
| **TableauBordMecanicien.tsx** | `/api/v2/fabrication/machines` · `/of` | `planningMachines` écrasé par la liste machines + OF assigné. Mock fallback. |
| **TableauBordMagasinPF.tsx** | `/api/v2/fabrication/of` | `commandes` hydratées depuis OFs. Mock fallback. |
| **DashboardRHManager.tsx** | `/api/v2/rh/comptes-employes/kpi` · `/employes` · `/candidatures` · `/primes-bordereaux` | KPIs effectif + masse salariale live, funnel calculé depuis candidatures, primes à payer live. |
| **DashboardChefProduction.tsx** | *(déjà branché Phase E/F pass 1)* | Pas re-touché. |
| **DashboardMagasinierSoustraitants.tsx** | *(déjà branché Phase B)* | Pas re-touché. |
| **DashboardCommercial.tsx** | *(déjà branché, `evolutionCA` reste calculé avec un fallback)* | Pas re-touché. |

## (b) Endpoints v2 nouvellement créés

Backend (`backend/modules-v2/qualite/controles/`) :

- `GET /api/v2/qualite/controles/taux-conformite?periode=30j`
  - SQL réelle : `COUNT(*) FILTER (WHERE est_bloquant=false)` / `COUNT(*)` sur `controles_qualite` avec `date_controle >= NOW() - interval`.
  - Retour `{periode, periode_jours, total, conformes, non_conformes, taux}`.
- `GET /api/v2/qualite/controles/recents?limit=20`
  - SQL `SELECT ... FROM controles_qualite LEFT JOIN ordres_fabrication ORDER BY date_controle DESC LIMIT N`.

Les routes `ia-agents/{agents,runs,findings}` existaient déjà (via `backend/modules-v2/ia-agents/*`) — exposées sous `/api/v2/ia-agents/{agents,runs,findings}` par l'index v2.

Frontend `services/api.ts` — nouveaux services :

- `qualiteService.getTauxConformite(periode)` / `getControlesRecents(limit)`
- `iaAgentsService.getAgents()` / `getRuns(limit)` / `getFindings(limit)`
- `rhDashboardService.getComptesKpi()` / `getEmployes()` / `getCandidatures()` / `getPrimesBordereaux()`

Tous avec `catch → { data: { data: [] | {} } }` (dégradation gracieuse).

## (c) Mocks supprimés par dashboard

| Dashboard | Constantes/useState mock remplacées |
|---|---|
| DashboardIA | `AGENTS` (5 agents) + `RAPPORTS` (4 rapports) → hydratation API (2) |
| DashboardAdministrateur | 1 KPI littéral `"98%"` → live |
| DashboardControleCentral | 5 séries chart + `controlesRecents` + 8 KPI littéraux → live (6) |
| DashboardMagasinierMP | `preparationsEnCours` initial → hydraté (1) |
| DashboardPostCoupe | `planningEnCours` initial → hydraté (1) |
| DashboardTisseur | `mesOF` (5 OFs) → hydraté (1) |
| ChefAtelierDashboard | `commandesEnCours` (2 cmds × plusieurs articles) → hydraté (1) |
| TableauBordMecanicien | `planningMachines` (4 machines) → hydraté (1) |
| TableauBordMagasinPF | `commandes` (3 commandes) → hydraté (1) |
| DashboardRHManager | `FUNNEL`, `PRIMES`, 3 KPI littéraux (87/146200/6) → hydratés (3) |

**Total : ~18 blocs de mock remplacés par de la vraie donnée API** (avec fallback gracieux systématique en cas d'erreur réseau ou 404).

## (d) Composant Avatar

Créé : `frontend/src/components/Avatar.tsx`. Props : `nom`, `prenom`, `photoUrl?`, `size`, `rounded`.

- Si `photoUrl` → `<img>` avec `onError` fallback automatique vers initiales.
- Sinon → `<div>` avec initiales + couleur dérivée du hash DJB2 du nom complet, projetée sur la palette La Plume (terracotta/sage/indigo/gold/brown/rose).
- Zéro appel réseau externe (plus de `ui-avatars.com`).

Aucune occurrence de `ui-avatars.com` n'a été trouvée dans le code (grep négatif) ; le composant est prêt à être réutilisé dès qu'un consommateur affiche un collaborateur. Les `<img>` existants (reçus de primes, photos de machines, logos fournisseurs) ne sont pas des avatars de personnes et sont laissés en place.

## (e) tsc final

```
cd frontend && npx tsc --noEmit  →  EXIT 0
```

## (f) Reste à faire

1. **Projection stock MP par entrepôt** (`DashboardMagasinierMP` : usine/E1/E2) — endpoint backend absent, mock conservé en fallback. À poser côté `backend/modules-v2/stock/matieres-premieres` (vue agrégée).
2. **Séries graphiques `DashboardControleCentral`** (par secteur, radar sécurité, incidents 6 mois) — démarrent à `[]`. Nécessitent de nouveaux agrégats SQL dans `qualite/controles` ou un nouveau sous-module `qualite/rapports`.
3. **Formations & entretiens** (`DashboardRHManager`) — toujours sur mock. Nécessite des sous-modules `rh/formations` et `rh/entretiens` (créer tables + routes).
4. **Hydratation `TableauBordMecanicien`** : seuls `planningMachines` sont live — `ensouples`, `demandesOurdissage`, `demandesNouage`, `demandesAchat`, `planRevisions`, `controles`, `rendementStats` restent mock. Nécessite des endpoints dédiés (`fabrication/ourdissage`, `fabrication/maintenance`).
5. **Suivi fabrication par opération** (`ChefAtelierDashboard` : frange/pliage/étiquetage…) — la projection OF→opérations est à poser côté backend (table `suivi_fabrication` + enveloppe `operations`).
6. **DashboardCommercial `evolutionCA`** — toujours un fallback `Math.random()` dans un `useMemo`. Endpoint backend `GET /commercial/:id/evolution-ca-12mois` à poser.
7. **`Avatar` à adopter dans l'UI** : brancher sur `UserBar`, `Equipe`, `Clients`, `Fournisseurs`, etc. (hors scope de cette passe car aucun appel `ui-avatars.com` à remplacer).
