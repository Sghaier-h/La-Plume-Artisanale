# T2 — Rapport ADMIN

Simulation d'un utilisateur ADMIN (`admin@system.local`) sur l'ERP La Plume Artisanale en production (backend `localhost:5000`, frontend `localhost:3000`). Objectif : relever remarques UX §14ter.18, fonctionnalités manquantes, bugs.

## Scénarios exercés

| # | Scénario | Résultat | Endpoint / preuve |
|---|---|---|---|
| 1 | Dashboard admin KPIs | ✅ `/api/dashboard/kpis` renvoie `clients`, `commandes`, `devis`, `factures`, `OF`… — mais **pas de /api/v2/** équivalent | `/api/dashboard/kpis` 200 ; `/api/v2/dashboard/kpis` 404 |
| 2 | Lister sociétés + basculer | ✅ `/api/v2/societes` liste 10 sociétés. `POST /:id/basculer` OK sur id=1 | 200 |
| 3 | Vue consolidée ventes | ✅ `/api/v2/societes/consolide/ventes` OK | 200 |
| 3b | Vue consolidée personnel | ❌ 404 `/api/v2/societes/consolide/personnel` | 404 |
| 4 | Lister clients CRM + fiche | ✅ `/api/v2/crm/comptes` + `/comptes/1` | 200 |
| 5 | Lister utilisateurs | ❌ **500** `column "mfa_actif" does not exist` | 500 |
| 6 | Rôles / permissions | ❌ `/api/v2/base/roles` et `/base/permissions` n'existent pas | 404 |
| 7 | Paramétrage numérotation / TVA / journaux / PCG | ⚠️ `/params/numerotation` renvoie `[]` (vide), `/comptabilite/tva` renvoie `[]`, `/comptabilite/journaux` 404, `/comptabilite/pcg` 404 | 200/404 |
| 8 | Compta : écritures, caisses, rapprochement | ⚠️ écritures + caisses OK ; **rapprochement 404** | 200/404 |
| 9 | Dossiers import / cessions / compensations | ✅ les 3 endpoints OK avec données démo | 200 |
| 9b | `/api/v2/comptabilite/apport-gerant` (§14quater.6) | ❌ 404 route non montée | 404 |
| 10 | IA agents + runs + findings | ✅ `/api/v2/ia-agents/{agents,runs,findings}` tous 200 | 200 |
| 11 | RH : employés, paies, avances, avertissements, formations, entretiens, ajustements, pointages, congés | ✅ **tous 200** | 200 |
| 12 | Audit trail | ⚠️ `/api/audit` 200, mais `/api/v2/audit` 404 (incohérence) | mixte |
| 13 | `wrapAdminEdit` sur facture validée | ✅ PUT sans raison → **400 `reason_required`** avec message FR actionnable ; avec header `x-admin-edit-reason` → 200 | 400→200 |
| 14 | SessionTimeoutManager | ✅ composant présent `frontend/src/components/SessionTimeoutManager.tsx` (14 min warning + 15 min logout, idle + axios interceptors, debounce 500 ms) | code OK |
| 15 | Export xlsx | ❌ `/api/v2/export/clients?format=xlsx` 404 (aucun endpoint d'export générique) | 404 |

## Remarques UX §14ter.18

- **[UX-MAJ] Erreurs backend brutes non actionnables.** `POST /api/v2/rh/avances {}` renvoie `null value in column "id_employe" of relation "avances_salaires" violates not-null constraint` (code 23502). Viole la règle « jamais Erreur serveur seul — toujours quoi corriger et comment ». À comparer avec `POST /api/v2/ventes/devis {}` qui, lui, répond proprement `expected number, received undefined` par champ (bon exemple à généraliser).
- **[UX-MAJ] Numérotation 100 % auto non amorcée.** `config_numerotation` est vide à l'install (`/api/v2/params/numerotation` retourne `[]`). L'ADMIN doit saisir manuellement toutes les séries (DEV-xxxx, CMD-xxxx, FA-xxxx…) avant la première transaction. Contredit « jamais à l'utilisateur de saisir … Formats configurés dans `config_numerotation` ».
- **[UX-MAJ] Pas de hub ni de bandeau d'alertes sur `/dashboard-admin`.** `DashboardAdministrateur.tsx` affiche 8 KpiCard + 3 charts verticaux (scroll long), alors que §14ter.17c impose « hub d'icônes + bandeau alertes, PAS de scroll long ».
- **[UX-MIN] Table `societes` polluée.** 6 lignes « Test multisociete-companies 1769729584800 » visibles côté admin alors que §14quater.1 exige exactement 5 sociétés : LP / CAPSCOR / AT / PMG / HS. Les 5 cibles existent (ids 5–9) mais noyées dans les seeds de test.
- **[UX-MIN] Erreur 500 au lieu de 404.** `GET /api/v2/ventes/factures/99999` → `{"error":{"message":404}}` avec HTTP **500** (le code est passé en message, le `message` field exposé « 404 » n'est pas actionnable).
- **[UX-MIN] Incohérence versioning dashboard.** KPIs admin sous `/api/dashboard/kpis` (v1) tandis que le reste du monde ADMIN est sous `/api/v2/*` → risque de confusion maintenance.

## Fonctionnalités manquantes

- **[MANQUE] CRUD sociétés** : pas de `POST`/`PUT`/`DELETE` sur `/api/v2/societes` (ADMIN ne peut pas créer ou archiver une société via API — uniquement lecture et bascule).
- **[MANQUE] Gestion rôles/permissions ADMIN** : `/api/v2/base/roles` et `/api/v2/base/permissions` inexistants. Pas d'écran « Qui a quel droit » accessible.
- **[MANQUE] Vue consolidée personnel** `/societes/consolide/personnel` (effectif + masse salariale par société) → 404.
- **[MANQUE] Rapprochement bancaire** (`/comptabilite/rapprochement` 404) et **apport gérant** (`/comptabilite/apport-gerant` 404) — tous deux déclarés dans `modules-v2/index.js` mais non montés.
- **[MANQUE] Qualité rapports** `/api/v2/qualite/rapports` 404 (le sous-module `rapports` est listé mais non monté).
- **[MANQUE] Export XLSX/CSV générique** (clients, factures, écritures) — aucun endpoint `/export`.
- **[MANQUE] Audit trail v2** `/api/v2/audit` 404 ; `/api/audit` v1 existe mais pas filtrable finement par entité, user, date range via UI.
- **[MANQUE] Seed PCG + journaux + TVA** : `/comptabilite/journaux` et `/comptabilite/pcg` 404 → pas de plan comptable fourni, l'ADMIN ne peut pas démarrer une saisie comptable propre.

## Bugs

- **[CRIT] GET `/api/v2/users` → 500** `column "mfa_actif" does not exist`. Migration manquante : la colonne est référencée dans `backend/modules-v2/users/model.js` + `auth/service.js` mais absente du schéma Postgres. **Bloque toute la gestion utilisateurs ADMIN.**
- **[CRIT] Seed sociétés non conforme §14quater.1** : 10 sociétés en base avec codes `SOC-1..SOC-6`, `LP`, `CAPSCOR`, `AT`, `PMG`, `HS`. Les 5 « Test multisociete-companies <timestamp> » doivent disparaître avant toute mise en prod.
- **[MAJ] 500 sur fiche inexistante** : `/api/v2/ventes/factures/99999` → HTTP 500 avec `{"error":{"message":404}}` (le code est passé comme message, mauvais wrapping).
- **[MAJ] Routes non montées malgré déclaration** : `comptabilite/rapprochement`, `comptabilite/apport-gerant`, `qualite/rapports` listées dans `modules-v2/index.js` mais 404 — probablement `routes.js` manquant ou import.default absent (log `[modules-v2] N routes montées, X échouées` à vérifier au boot).
- **[MAJ] POST `/rh/avances` sans body** : expose erreur Postgres brute (contrainte NOT NULL) au lieu d'un message validé Zod comme sur `/ventes/devis`.
- **[MIN] `/api/v2/params/societe` sans id → 404 « Société introuvable »** : la route devrait retourner les paramètres de la société courante (`x-societe-id` déjà envoyé) ou lister. Comportement actuel = cul-de-sac pour l'ADMIN.
- **[MIN] `/api/v2/params/numerotation/prochain` sans query → 404 code introuvable** : devrait exiger `?code=` explicite dans la 400 plutôt que 404 anonyme.
- **[MIN] Incohérence header admin-edit** : la doc backend (`admin-edit-guard.js:144`) suggère `x-admin-edit-reason` mais le message d'erreur mentionne également `raison_edition_admin` dans le body — nom à harmoniser côté frontend `useAdminEdit`.
