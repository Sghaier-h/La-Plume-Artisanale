# Phase E4 — Fusion Stock + Produits + Fabrication (passe 1)

Suite de la Phase D (ventes) : port verbatim des handlers legacy vers
`modules-v2/`, puis suppression de l'équivalent `backend/modules/*`. Le scope
du cahier des charges couvrant une surface très large (14 sous-modules), cette
passe se concentre sur les trois domaines à plus fort trafic : **Stock
(matières premières, traçabilité lots, fournitures) + OF + Machines + Suivi
fabrication**.

## (a) Sous-modules portés

| v2 nouveau sous-module                 | Source legacy portée                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| `stock/matieres-premieres`             | `modules/matieres-premieres/` (overwrite du stub CRUD)       |
| `stock/tracabilite-lots`               | `modules/tracabilite-lots/`                                  |
| `stock/fournitures`                    | `modules/fournitures/` (alias `articles-catalogue`)          |
| `fabrication/of`                       | `modules/of/` (incl. `alimentation.controller.js`)           |
| `fabrication/machines`                 | `modules/machines/`                                          |
| `fabrication/suivi`                    | `modules/suivi-fabrication/`                                 |

Pour chaque sous-module : `legacy-controller.js` + `legacy-routes.js` copiés
tels quels (seuls les imports relatifs patchés), `routes.js` ré-exporte
`./legacy-routes.js`, `manifest.js` + `README.md` ajoutés. Enregistrement
effectif dans `modules-v2/index.js` (groupes `stock` et `fabrication`
étendus — slugs par défaut suffisants, pas d'alias nécessaire).

Dépendances inter-legacy préservées via chemin cross-dir :
- `fabrication/of/legacy-routes.js` → `modules/production/controllers/production.controller.js` (actions `demarrer`/`terminer`/`updateProduction`).
- `stock/fournitures/legacy-routes.js` → `modules/articles-catalogue/controllers/articles-catalogue.controller.js`.

Tests boot : `[modules-v2] 110 routes montées, 0 échouées`. Curl smoke :
`/api/v2/stock/matieres-premieres`, `/tracabilite-lots`, `/fournitures`,
`/api/v2/fabrication/{of,machines,suivi}` → tous **401** (auth requise, pas 404).
Legacy équivalents → **404** (plus montés).

## (b) Services `frontend/src/services/api.ts` repointés

| Service                       | Ancien chemin                           | Nouveau chemin                                   |
| ----------------------------- | --------------------------------------- | ------------------------------------------------ |
| `matieresPremieresService`    | `/matieres-premieres/*`                 | `/v2/stock/matieres-premieres/*`                 |
| `tracabiliteLotsService`      | `/tracabilite-lots/*`                   | `/v2/stock/tracabilite-lots/*`                   |
| `fournitureService`           | `/fournitures/*`                        | `/v2/stock/fournitures/*`                        |
| `machinesService`             | `/machines/*`                           | `/v2/fabrication/machines/*`                     |
| `ofService`                   | `/of/*`                                 | `/v2/fabrication/of/*`                           |
| `suiviFabricationService`     | `/suivi-fabrication/*`                  | `/v2/fabrication/suivi/*`                        |

Appels `api.get/post/put` directs également repointés dans :
`pages/fabrication/MachinesMaintenance.tsx`, `pages/TabletteMagasinier.tsx`,
`pages/TabletteCoupeur.tsx` (2 appels), `pages/TabletteTisseur.tsx` (3 appels).

Signatures publiques préservées (comme Phase D). `npx tsc --noEmit` → exit 0.

## (c) Modules legacy supprimés

- `backend/modules/matieres-premieres/`
- `backend/modules/tracabilite-lots/`
- `backend/modules/fournitures/`
- `backend/modules/of/`
- `backend/modules/machines/`
- `backend/modules/suivi-fabrication/`

Les manifests legacy qui déclarent `depends: ["machines"]` ou `["of"]`
(`production`, `maintenance`, `selecteurs-machines`) continuent de se charger
sans friction : `ModuleManager.topologicalSort()` ignore les dépendances
absentes du jeu chargé.

## (d) Reste à faire (passes ultérieures)

**Stock** — rien.

**Produits** (aucun port effectué) :
- `produits/catalogue` à créer depuis `modules/articles-catalogue/` (bloqueur
  pour supprimer legacy `articles-catalogue` + `fournitures` dépendent déjà
  indirectement).
- `produits/attributs` depuis `modules/parametres-catalogue/`.
- `produits/articles-generes` depuis `modules/articles-generes/` (dépend aussi
  `articles-catalogue`).
- Les modules legacy `produits/`, `modeles/`, `articles/`, `bom/` restent
  encore à auditer (les v2 `produits/{familles,modeles,articles}` et
  `bom/{master,composants}` sont déjà scaffoldés mais pas forcément
  fonctionnellement complets).

**Fabrication** (partiel) :
- `fabrication/mrp` depuis `modules/mrp/`.
- `fabrication/taches` depuis `modules/taches/`.
- `fabrication/maintenance` depuis `modules/maintenance/`.
- `fabrication/planning-gantt` depuis `modules/planification-gantt/` +
  `modules/planning-dragdrop/`.
- `fabrication/production` (ou intégration dans `fabrication/of`) depuis
  `modules/production/` : bloqueur pour supprimer legacy `production/` dont
  dépend aujourd'hui `fabrication/of/legacy-routes.js`.
- `modules/sale/`, `modules/selecteurs-machines/` à auditer.

**Qualité** :
- `qualite/avance` depuis `modules/qualite-avance/` + `modules/quality/` +
  `modules/qualite-avancee/`.

**Services frontend non repointés** (pas d'équivalent v2 à ce stade) :
`stockService` (`/stock/mp`, `/stock/pf`, `/stock/mouvements`, `/stock/pickings`),
`inventaireService`, `entrepotService`, `planningService` (`/planning-dragdrop`),
`articlesService`, `modelesService`, `articlesCatalogueService`,
`parametresCatalogueService`, `articlesGeneresService`, `tachesService`,
`maintenanceService`, `ganttService`, `qualiteService`,
`qualiteAvanceeService`, `mrpService`, `bomService`, `fournisseursService`.

À traiter dans Phase E5 (produits + reste fabrication + qualité).
