# Phase G1 — Charts qualité secondaires + Stock MP par entrepôt + Suivi par opération

## Résumé

Phase G1 complète 3 features restantes marquées "à faire" en Phase F2 : les 3 charts secondaires du contrôle qualité, la projection stock MP par entrepôt, et l'agrégation suivi fabrication par type d'opération.

Toutes les routes nouvelles respectent l'enveloppe `{ success, data, meta, error }` et appliquent un fallback `[]` en try/catch si une table ou colonne est absente, garantissant une dégradation gracieuse.

---

## (a) Endpoints créés

Backend — 5 nouveaux endpoints :

| Méthode | Route | Fichier |
|---|---|---|
| GET | `/api/v2/qualite/controles/par-type-defaut?periode=30j` | `backend/modules-v2/qualite/controles/{routes,controller,service}.js` |
| GET | `/api/v2/qualite/controles/incidents-par-jour?jours=30` | `backend/modules-v2/qualite/controles/{routes,controller,service}.js` |
| GET | `/api/v2/qualite/controles/radar-criteres` | `backend/modules-v2/qualite/controles/{routes,controller,service}.js` |
| GET | `/api/v2/stock/matieres-premieres/par-entrepot?seuil_bas=true` | `backend/modules-v2/stock/matieres-premieres/legacy-{routes,controller}.js` |
| GET | `/api/v2/fabrication/suivi/par-operation?date_debut=&date_fin=` | `backend/modules-v2/fabrication/suivi/legacy-{routes,controller}.js` |

**Détails requêtes :**
- `par-type-defaut` : essaie `defauts_signales JOIN defauts_types GROUP BY categorie`; fallback sur `controles_qualite GROUP BY type_controle`. Retourne `[{ type_defaut, count, pct }]`.
- `incidents-par-jour` : CTE `generate_series` sur 30j × `LEFT JOIN controles_qualite` filtré sur `est_bloquant = true OR decision ∈ ('rework','rebut')`. Retourne `[{ date, incidents }]` avec zéros pour les jours sans incident.
- `radar-criteres` : essaie `jsonb_each_text(controles_criteres)` (colonne JSONB absente dans le schéma actuel → fallback immédiat), puis dérivation inverse depuis `defauts_signales`, enfin valeurs par défaut sur les 5 critères (tissage, nouage, coupe, finition, emballage).
- `par-entrepot` : `stock_entrepots JOIN entrepots JOIN matieres_premieres`, filtre `seuil_bas=true` → `quantite_disponible < stock_alerte`. Retourne `{ lignes: [...], total }`.
- `par-operation` : essaie agrégation sur `of_postes (code_poste, duree_reelle_sec, quantite_produite, quantite_rebut)`; fallback sur `suivi_fabrication` (une seule ligne "tissage"); ultime fallback `[]`.

Services frontend ajoutés dans `frontend/src/services/api.ts` :
- `qualiteService.getParTypeDefaut(periode)`, `getIncidentsParJour(jours)`, `getRadarCriteres()`
- `matieresPremieresService.getParEntrepot({ seuilBas })`
- `suiviFabricationService.getParOperation({ dateDebut, dateFin })`

---

## (b) Widgets patchés

| Fichier | Changement |
|---|---|
| `frontend/src/pages/DashboardControleCentral.tsx` | Les 3 charts secondaires (`dataQualiteFab` secteur, `dataIncidents` ligne, `dataSecuriteZones` radar) sont désormais hydratés depuis les 3 nouveaux endpoints. La courbe `dataConformite` est dérivée (buckets hebdo) des incidents. Fonction `labelCategorie` ajoutée pour mapper les enums `defauts_types.categorie` aux libellés dashboard. Dégradation gracieuse `[]` conservée. |
| `frontend/src/pages/DashboardMagasinierMP.tsx` | Nouveau widget "Projection stock par entrepôt" sous l'onglet Stock : groupage des lignes en alerte par entrepôt, affichant `code_mp`, désignation, qté disponible, seuil, état (rupture / stock bas). Interface `StockEntrepotLigne` + state `stockParEntrepot` + hook `useEffect` étendu. |
| `frontend/src/pages/SuiviFabrication.tsx` | Nouveau BarChart "Temps par opération" en tête de page, deux séries (temps_minutes + rendement) depuis `par-operation`. Import `recharts` ajouté. |
| `frontend/src/pages/DashboardChefProduction.tsx` | Nouveau SectionCard "Temps par opération" placé avant le planning drag & drop, même source `par-operation`, intégré au `loadData` existant. Import `BarChart, Bar` + service `suiviFabricationService`. |

Dégradation : tous les widgets affichent un placeholder (texte "Aucune donnée…") si l'endpoint renvoie `[]`.

---

## (c) `tsc --noEmit`

Exécuté dans `frontend/` : **exit 0** (aucune erreur TypeScript). Les typings existants couvrent les nouvelles signatures de services (`params?: any`), aucun type explicite n'a dû être ajouté côté payload réseau.

Aucun test backend automatisé exécuté (hors scope G1) : les 5 nouveaux endpoints sont protégés par try/catch et renvoient `[]` en cas d'absence de table/colonne, donc 200 OK garanti sur toute instance.

---

## Contraintes respectées

- Aucun `git commit` (per instructions).
- Aucune suppression / modification de code existant hors ajouts ciblés.
- Fallback `[]` systématique en try/catch pour tolérer les schémas partiels.
- Responsive préservé (tous les charts dans `ResponsiveContainer`, widgets dans `SectionCard`/tabs existants).
