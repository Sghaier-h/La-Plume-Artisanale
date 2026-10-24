# Phase G3 — Fusion legacy finale (suite E4 pass 2)

Objet : porter les 12 derniers modules legacy "métier" (hors utilitaires et
hors `bons-retour` qui reste legacy par choix Phase D) sous `backend/modules-v2/`,
supprimer les sources originelles, repointer les services frontend concernés.

## (a) Sous-modules v2 créés

| Groupe       | Sous-module (v2)                          | Source legacy fusionnée                                                           |
| :----------- | :---------------------------------------- | :-------------------------------------------------------------------------------- |
| produits     | `produits/catalogue`                      | `modules/articles-catalogue`                                                      |
| produits     | `produits/attributs`                      | `modules/parametres-catalogue` (2 controllers)                                    |
| produits     | `produits/articles-generes`               | `modules/articles-generes` (alias vers catalogue)                                 |
| fabrication  | `fabrication/mrp`                         | `modules/mrp` (5 ressources : productions, boms, work-centers, work-orders, routings) |
| fabrication  | `fabrication/taches`                      | `modules/taches`                                                                  |
| fabrication  | `fabrication/maintenance`                 | `modules/maintenance`                                                             |
| fabrication  | `fabrication/planning-gantt`              | fusion `modules/planification-gantt` + `modules/planning-dragdrop`                |
| fabrication  | `fabrication/of` (étendu)                 | `modules/production` absorbé — `legacy-production-controller.js` (lève le bloqueur E4) |
| qualite      | `qualite/avance`                          | fusion `modules/qualite-avance` + `modules/qualite-avancee` + `modules/quality`   |

Chaque nouveau sous-module expose `routes.js` + `manifest.js` + `README.md` et
réexpose les contrôleurs legacy copiés verbatim (`legacy-*.js`). Les modèles
MRP (`MrpProduction`, `MrpBOM`, etc.) ont été portés dans
`fabrication/mrp/models/` ; `backend/src/core/ModelRegistry.js` a été repointé
en conséquence.

Le routeur v2 central `backend/modules-v2/index.js` a été étendu
(groupes `produits`, `fabrication`, `qualite`).

## (b) Services frontend repointés (`frontend/src/services/api.ts`)

Repointage préservant toutes les signatures publiques :

| Service                          | Ancien préfixe          | Nouveau préfixe                           |
| :------------------------------- | :---------------------- | :---------------------------------------- |
| `articlesCatalogueService`       | `/articles-catalogue`   | `/v2/produits/catalogue`                  |
| `parametresCatalogueService`     | `/parametres-catalogue` | `/v2/produits/attributs`                  |
| `articlesGeneresService`         | `/articles-generes`     | `/v2/produits/articles-generes`           |
| `productionService`              | `/production/*`         | `/v2/fabrication/of` / `/machines` / `/planning` |
| `mrpService` + `bomService`      | `/mrp`                  | `/v2/fabrication/mrp`                     |
| `tachesService`                  | `/taches`               | `/v2/fabrication/taches`                  |
| `maintenanceService`             | `/maintenance`          | `/v2/fabrication/maintenance`             |
| `planningService` (gantt + DnD)  | `/planification-gantt`, `/planning-dragdrop` | `/v2/fabrication/planning-gantt` |
| `qualiteService` (av+avee)       | `/qualite-avance`, `/qualite-avancee` | `/v2/qualite/avance`         |
| `qualityService` (checks/points/alerts) | `/quality/*`     | `/v2/qualite/avance/{checks,points,alerts}` |

`backend/modules-v2/stock/fournitures/legacy-routes.js` (Phase E4) a aussi été
patché pour importer depuis `../../produits/catalogue/legacy-controller.js`
plutôt que depuis le module legacy supprimé.

## (c) Modules legacy supprimés (12)

```
backend/modules/articles-catalogue      ✗
backend/modules/parametres-catalogue    ✗
backend/modules/articles-generes        ✗
backend/modules/mrp                     ✗  (modèles → modules-v2/fabrication/mrp/models/)
backend/modules/planification-gantt     ✗
backend/modules/planning-dragdrop       ✗
backend/modules/taches                  ✗
backend/modules/maintenance             ✗
backend/modules/production              ✗  (lève le bloqueur Phase E4 : contrôleur absorbé dans fabrication/of)
backend/modules/qualite-avance          ✗
backend/modules/qualite-avancee         ✗
backend/modules/quality                 ✗
```

Les variantes personnelles `*-Laptop-Sgh.js` (ModelRegistry/server) qui
référençaient encore les anciens chemins ne sont importées nulle part et ont
été laissées intactes.

## (d) Routes consolidées

Au boot : **`[modules-v2] 121 routes montées, 0 échouées`** (contre 108 avant
G3). Les 13 nouvelles routes correspondent aux 9 nouveaux sous-modules
(certains comme `fabrication/mrp` montent un sous-router qui regroupe 5
ressources — comptées comme 1 au niveau du router principal).

## (e) tsc final

`cd frontend && npx tsc --noEmit` → **exit 0**.

## (f) Vérifications endpoints

Serveur booté sans erreur `Cannot find module`. Tests `curl` :

| Endpoint v2 (attendu 401)                        | Résultat |
| :----------------------------------------------- | :------: |
| `/api/v2/produits/catalogue`                     | **401**  |
| `/api/v2/produits/attributs(/complet)`           | **401**  |
| `/api/v2/produits/articles-generes`              | **401**  |
| `/api/v2/fabrication/mrp/{boms,productions,work-centers,work-orders,routings}` | **401** |
| `/api/v2/fabrication/{taches,maintenance,planning-gantt}` | **401** |
| `/api/v2/qualite/avance(/controles)`             | **401**  |
| `/api/v2/qualite/avance/{checks,points,alerts}`  | **401**  |

| Endpoint legacy (attendu 404)                    | Résultat |
| :----------------------------------------------- | :------: |
| `/api/articles-catalogue`, `/api/parametres-catalogue`, `/api/articles-generes` | **404** |
| `/api/mrp/{boms,productions}`, `/api/taches`, `/api/maintenance` | **404** |
| `/api/planification-gantt`, `/api/planning-dragdrop`, `/api/production` | **404** |
| `/api/qualite-avance/controles`, `/api/qualite-avancee/controles`, `/api/quality/checks` | **404** |

## Reste à faire

Néant côté scope G3 — les 12 modules sont portés, les 3 groupes du contrat
sont couverts, le bloqueur Phase E4 (`production/`) est levé. À noter pour une
passe future :

- Variantes `*-Laptop-Sgh.js` à nettoyer (hors scope — pas chargées).
- Les modèles `QualityCheck`/`QualityPoint` encore référencés uniquement par
  `ModelRegistry-Laptop-Sgh.js` (variante morte) — pas de porting nécessaire.
- `postLoad` hook MRP (`backend/modules/mrp/hooks/postLoad.js`) non ré-exposé
  (triviale journalisation — supprimé avec le reste du legacy).
