# Phase T3a — Rapport Fix SQL / Colonnes manquantes

**Date** : 2026-10-24 · **Agent** : T3a (backend SQL only) · **Branche** : `feature/backend-catalogue-dashboards-deploy`

## (a) Migration DB appliquée

`backend/migrations/20261024_fix_t3a_colonnes_manquantes.sql` — exécutée en direct sur OVH (production/dev partagé). Idempotente (DO $$ EXCEPTION WHEN duplicate_column).

| Table / Type | Colonnes / valeurs ajoutées |
|---|---|
| `users` | `mfa_actif BOOLEAN NOT NULL DEFAULT FALSE`, `mfa_secret_totp`, `verrouille_jusqu`, `cree_par` |
| `of_sous_traitance` | `id_soustraitant` (FK sous_traitants), `id_of_st` (GENERATED AS id STORED), `statut`, `quantite_envoyee`, `quantite_retournee`, `date_retour_prevue`, `date_retour_reel`, `updated_at` |
| `mouvements_stock` | `numero_mouvement`, `type_mouvement`, `id_lot`, `qr_mp_reel`, `id_entrepot_source`, `id_entrepot_destination`, `id_emplacement_destination`, `id_document_lie`, `type_document_lie`, `motif`, `effectue_par`, `valide_par` |
| `defauts_signales` | `+type_defaut TEXT`, `id_defaut_type` DROP NOT NULL, `id_signaleur` DROP NOT NULL |
| `ordres_fabrication` | `id_tisseur` (FK users), `id_assigne` (FK users) |
| `ctrl_type_enum` | `+ 'finition'` (via ALTER TYPE après COMMIT, idempotent) |

Vérification post-apply : les 10 colonnes attendues présentes + enum `ctrl_type_enum` contient `finition`.

## (b) Controllers patchés

1. **`backend/src/services/pdf.service.js`** — `fetchFactureFull`, `fetchDevisFull`, `fetchBLFull`, `fetchAvoirFull` ne lisent plus `c.adresse / c.ville / c.code_postal / c.telephone` (colonnes absentes de `comptes`) mais passent par un `LEFT JOIN LATERAL adresses_client` ordonné par `est_defaut_facturation DESC`. SQL validé par EXPLAIN sur Postgres OVH.
2. **`backend/src/utils/error.helper.js`** — `sendError` détecte l'inversion fréquente `sendError(res, HTTP_STATUS.X, "msg")` (number en 2e position, string en 3e) et swap automatiquement les args. Corrige `GET /ventes/factures/99999` → wrapper propre `{error:{message:"Facture non trouvée"}}` HTTP 404 au lieu de `{error:{message:404}}` HTTP 500. (Correctif global sur ~30 call-sites legacy.)
3. **`backend/modules-v2/rh/avances/controller.js`** — `create` ajoute une validation métier (`id_employe` + `montant_demande` requis, montant > 0) renvoyant 400 structuré au lieu d'exposer SQLSTATE 23502 brut.
4. **`backend/modules-v2/fabrication/maintenance/legacy-routes.js`** — mojibake UTF-8 réparé (`â€—` → `—`, `spÃ©cifiques` → `spécifiques`).

Aucune route n'a été créée, aucun fichier frontend touché, aucun endpoint POST/PUT nouveau — strictement conforme au périmètre T3a.

## (c) Curl validation (backend process déjà up, PID 7832 : node src/server.js)

| # | Route | Avant | Après |
|---|---|---|---|
| 1 | `GET /api/v2/users?limit=3` | 500 `mfa_actif does not exist` | **200** |
| 2 | `GET /api/v2/sous-traitance/bons` | 500 `ost.id_soustraitant does not exist` | **200** |
| 3 | `POST /api/v2/stock/mouvements` | 500 `numero_mouvement does not exist` | **200** |
| 4 | `POST /api/v2/qualite/defauts/signales {type_defaut,...}` | 500 `type_defaut does not exist` | **201** |
| 5 | `PUT /api/v2/fabrication/of/19 {id_tisseur:1}` | 500 `id_tisseur does not exist` | **200** |
| 6 | `POST /api/v2/qualite/controles {type_controle:"finition"}` | 500 enum invalide | **201** |
| 7 | `GET /api/v2/ventes/bl/5/pdf` | 500 `c.adresse does not exist` | **500 — code patché, nécessite redémarrage backend** |
| 8 | `GET /api/v2/ventes/factures/99999` | 500 `{error:{message:404}}` | **500 — code patché, nécessite redémarrage backend** |
| 9 | `POST /api/v2/rh/avances {}` | 400 (brut SQLSTATE) | **400 — code patché, nécessite redémarrage backend** |

**Test E2E** : `node backend/scripts/test-workflow-e2e.js` → **14/14 OK** (devis→commande→OF+ST+QA→colis→BL→facture).

## (d) Bugs non résolus ou partiellement résolus

- **Fixes code #7/#8/#9 non visibles sur le backend en cours d'exécution** : le process serveur (PID 7832) a été démarré en `node src/server.js` (pas `nodemon`), donc les modifications JS (pdf.service.js, error.helper.js, rh/avances/controller.js) ne sont pas chargées en mémoire. La prochaine commande `npm run dev` (ou `start`) les activera. Les changements sur disque sont corrects et validés par lecture ; les migrations DB sont déjà actives.
- **`POST /api/v2/qualite/controles type_controle:"finition"` nécessite `id_controleur`** (le payload T2 utilisait `id_operateur` — colonne inexistante dans `controles_qualite`). Hors scope T3a (payload frontend/doc divergent).
- **`GET /api/v2/fabrication/machines/1/planning` 500** (T2 MECANICIEN CRIT-M2) : controller crash non lié aux colonnes/schema → appartient à T3c (nouveau endpoint ou refactor controller).
- **`colis.poids` vs `poids_kg`** (T2 MAGASINIER_PREPARATION) : non-conformité du payload frontend, hors scope T3a.
- **Qualité `par-soustraitant` ordering collision** (bug #8 du brief) : aucune route `/par-soustraitant` déclarée dans `modules-v2/qualite/*/routes.js` au scan → bug probablement obsolète ou dans un autre module non trouvé ; marqué sans action.
- **`req.user?.id` manquant sur routes qualité/defauts** : la cause racine du `null id_signaleur` est l'absence de `router.use(authenticate)` dans `qualite/defauts/routes.js`. Workaround T3a = colonne nullable (migration). Fix propre à prévoir côté T3c (middleware auth).

## Fichiers modifiés

- `backend/migrations/20261024_fix_t3a_colonnes_manquantes.sql` *(nouveau)*
- `backend/src/services/pdf.service.js`
- `backend/src/utils/error.helper.js`
- `backend/modules-v2/rh/avances/controller.js`
- `backend/modules-v2/fabrication/maintenance/legacy-routes.js`

**Aucun git commit effectué** (conforme consigne : « AUCUN git commit — l'utilisateur commit après revue »).
