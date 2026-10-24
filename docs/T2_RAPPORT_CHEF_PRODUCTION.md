# T2 — Rapport CHEF_PRODUCTION

**Rôle testé** : CHEF_PRODUCTION (`chef.production@entreprise.local`)
**Date** : 2026-10-24
**Scope** : 15 scénarios réalistes production — dashboard, OF, planning, affectation, suivi, sous-traitance, machines, alertes.

---

## (A) Remarques UX (§14ter.17c / §14ter.18)

- **UX-1 MAJ** — Dashboard viole §14ter.17c : bloc « Alertes urgentes » placé **tout en bas** (après KPI, charts, Gantt, tables ST). La règle exige la zone alertes **fixée en haut**. OF en retard et pannes passent inaperçus.
- **UX-2 MAJ** — Pas de hub d'icônes (§14ter.17c) : long scroll 4 KPI + 4 KPI + 2 charts + Gantt + 2 tables. Aucun carré tactile pour « Mon équipe / Mes OF / Signalements / Rapport perf ».
- **UX-3 MAJ** — Création OF trop pauvre : `POST /api/v2/fabrication/of` n'exige que `id_article` + `quantite_a_produire`. Pas d'enchaînement « commande → OF » en 1 clic (§14ter.18) exposé au chef.
- **UX-4 MAJ** — `/planification-gantt` sans drag-drop : `PlanificationGantt.tsx` ne contient AUCUN handler `draggable`/`onDrag`/`onDrop`. Impossible de replanifier à la souris.
- **UX-5 MIN** — Zone drag-drop du DashboardChefProduction fonctionne mais les colonnes « Aujourd'hui/Demain/J+2 … » sont **décoratives** : les OF ne sont pas positionnés selon `date_debut_prevue`.
- **UX-6 MIN** — Erreurs non actionnables (§14ter.18) : création sans article → « Article et quantité à produire requis » sans dire quel champ manque.

## (B) Fonctionnalités manquantes

- **FM-1 MAJ** — Maintenance v2 absente : `POST /api/v2/maintenance` → 404. Signaler panne ne crée pas de demande (scénario 13 KO).
- **FM-2 MAJ** — Affectation tisseur impossible : colonne `id_tisseur` **inexistante** sur `ordres_fabrication` (CRIT-2) + chef sans permission `user:consulter` → listing tisseurs 403.
- **FM-3 MAJ** — Pas d'étapes/gammes OF : `/api/v2/fabrication/of/:id/etapes` → 404. Décision interne vs sous-traitance par étape (frange/nouage/teinture) impossible (scénario 8).
- **FM-4 MAJ** — Routes sous-traitance v2 absentes : `/retours`, `/decisions`, `/soustraitants`, `/kpis` → 404. Scénarios 9-10 KO.
- **FM-5 MAJ** — Pas de rapport équipe : `/api/v2/fabrication/rapport` → 404 ; dashboard affiche TRS fallback 85% figé et rebut=0 TODO.
- **FM-6 MIN** — Pas de stock MP v2 : `/api/v2/mp` et `/api/v2/matieres-premieres` → 404. Lien manquant « voir stock MP » depuis la file d'attente OF.

## (C) Bugs

- **CRIT-1** — `GET /api/v2/sous-traitance/bons` → **HTTP 500** `column ost.id_soustraitant does not exist`. La page sous-traitants crash immédiatement.
- **CRIT-2** — `PUT /api/v2/fabrication/of/:id {"id_tisseur":5}` → **HTTP 500** `column "id_tisseur" of relation "ordres_fabrication" does not exist`. Affectation opérateur impossible.
- **CRIT-3** — Page `/planification-gantt` cassée : le backend retourne `{data:{items:[…id_commande…]}}`, le frontend lit `res.data.data.projets` puis `projet.id_projet`. Les deux clés sont fausses → `selectedProjet` reste `null`, aucune tâche ne s'affiche.
- **MAJ-1** — `PUT /api/v2/fabrication/of/9 {"statut":"ETAT_FUTURISTE"}` → HTTP 200, statut persisté sans validation enum.
- **MAJ-2** — Création OF avec `quantite_a_produire: -50` → HTTP 201. Quantité négative acceptée.
- **MAJ-3** — Création OF avec `date_debut_prevue > date_fin_prevue` → HTTP 201 sans erreur. Pas de contrôle cohérence dates.
- **MAJ-4** — Terminer un OF (`statut:"termine"`) n'alimente **ni** `date_fin_reelle` **ni** `quantite_produite`. Un OF peut rester « terminé » avec `quantite_produite=0` et `date_fin_reelle=null`. Rendement et TRS faussés.
- **MIN-1** — Dashboard `kpis-production` renvoie des strings (`"5"`, `"3"`) pour des compteurs numériques → KPI casting fragile.
- **MIN-2** — `dashboardService.getKpisProduction` ne renvoie ni rebut, ni respect-planning → placeholders codés en dur dans la UI.

**Verdict** : création/suivi OF **basiques fonctionnent**, mais drag-drop planning, affectation équipe, sous-traitance et maintenance sont **bloqués ou cassés**. Priorité fix : CRIT-1/2/3 + remonter la zone alertes en tête de dashboard.
