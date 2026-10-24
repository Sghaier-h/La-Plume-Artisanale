# Phase D — Consolidation modules legacy → modules-v2

**Date :** 2026-10-24
**Déclencheur :** demande utilisateur « il ne faut pas faire deux module de vente et client etc »
**Branche :** `feature/backend-catalogue-dashboards-deploy`
**Statut :** 5 domaines consolidés, 3 domaines en « fusion partielle » documentés pour une passe ultérieure.

---

## 1. Objectif

Supprimer la duplication historique entre `backend/modules/*` (ancienne architecture Odoo-style, préfixe `/api/*`) et `backend/modules-v2/*` (nouvelle architecture par domaine métier, préfixe `/api/v2/*`), introduite au fil des phases A → C.

Règle appliquée : lorsque le v2 couvre 100 % du legacy, supprimer le legacy et repointer le frontend. Lorsque le v2 est incomplet, conserver le legacy en attendant une passe de complément.

---

## 2. Domaines consolidés (v2 remplace legacy)

### 2.1 Clients / CRM
- **Legacy supprimé** : `backend/modules/clients/` (14 fichiers) sur `/api/clients/*`.
- **V2 canonique** : `backend/modules-v2/crm/comptes/` sur `/api/v2/crm/comptes/*`.
- **Frontend** : `services/api.ts → clientsService` repointé entièrement vers v2 (signatures publiques identiques). Pages `Clients.tsx`, `ClientDetails.tsx`, `ClientForm.tsx` conservées — elles consomment le service repointé.
- **Shims v2 ajoutés** : `GET /crm/comptes/categories` + `GET /crm/comptes/types-commerciaux` (lus par le wizard client legacy).

### 2.2 Sous-traitants
- **Legacy supprimé** : `backend/modules/soustraitants/` sur `/api/soustraitants/*` + `frontend/src/pages/Soustraitants.tsx` + `soustraitantsService` dans `api.ts` (bloc `@deprecated`).
- **V2 canonique** : `backend/modules-v2/sous-traitance/*` (Phase B) + `pages/sous-traitants/*`.
- **Route Frontend** : `/soustraitants` → `<Navigate to="/sous-traitants" replace />`. Transitif depuis `/soustraitants-odoo`.
- **Dashboards patchés** : `DashboardChefProduction.tsx` (via `soustraitantsApi.list`), `DashboardMagasinierSoustraitants.tsx` (via shim `soustraitantsCompat` + redirections workflow pour écriture).

### 2.3 RH
- **Legacy supprimé** : `backend/modules/hr/`, `backend/modules/payroll-tunisia/`, `backend/modules/pointage/` (31 fichiers).
- **V2 canonique** : `backend/modules-v2/rh/*` (18 sous-modules dont Phase C).
- **Alias serveur ajoutés** (compat sans toucher aux pages) : `/api/pointage` → routeur v2 `rh/pointage`, `/api/hr/recruitments` → routeur v2 `rh/recrutement`.
- **Legacy-handlers portés dans v2** : `legacy-handlers.js` (recrutement : stages/funnel/analytics/timeline), `legacy-pointage-handlers.js` + `legacy-timemoto-handlers.js` (stats, user daily/monthly, check-in/out, timemoto import CSV/JSON).
- **Frontend** : `hrEmployeesService`, `hrRecruitmentService`, `hrPayslipsService`, `payrollTunisiaService` repointés vers `/api/v2/rh/*`.

### 2.4 Comptabilité
- **Legacy supprimé** : `backend/modules/account/`, `backend/modules/accounting-tunisia/`, `backend/modules/relances/` + `backend/src/services/relances-scheduler.service.js` + `frontend/src/pages/RelancesFactures.tsx` (racine).
- **V2 canonique** : `backend/modules-v2/comptabilite/*` (Phase A + §10) sur `/api/v2/comptabilite/*`.
- **Route Frontend** : `/relances` → `<Navigate to="/ventes/relances-factures" replace />`.
- **Frontend** : `accountMovesService`, `accountingTunisiaService`, `bankReconciliationService`, `relancesService` repointés. `components/erp/views/OperationsPanel.tsx` migré (`/api/v2/comptabilite/ecritures/*`).
- **Model registry** : `AccountMove` retiré de `ModelRegistry.js`.

### 2.5 Ventes
- **Legacy supprimé** : `backend/modules/{devis,commandes,bons-livraison,factures,avoirs}/` (5 modules, 48 routes).
- **V2 canonique** : `backend/modules-v2/ventes/{devis,commandes,bl,factures,avoirs}/` sur `/api/v2/ventes/*`.
- **Stratégie choisie** : portage verbatim des handlers legacy dans v2 pour préserver 100 % des fonctionnalités (PDF, `/from-X`, `/transformer`, workflow transitions). Chaque module v2 pointe désormais sur `legacy-controller.js` + `legacy-routes.js` (copies verbatim), avec `routes.js` qui ré-exporte `./legacy-routes.js`.
- **Frontend** : `devisService`, `commandesService`, `bonsLivraisonService`, `facturesService`, `avoirsService` repointés vers `/api/v2/ventes/*` (signatures publiques identiques).
- **Bons-retour** : **Option B** retenue — `backend/modules/bons-retour/` conservé tel quel (routeur `/api/bons-retour/*`), `bonsRetourService` inchangé. `manifest.js` nettoyé pour retirer `commandes` de `depends` (ce legacy ayant été supprimé). TODO balisé dans `services/api.ts` pour un portage ultérieur en v2.

---

## 3. Domaines maintenus legacy (fusion ultérieure)

### 3.1 Stock
Pourquoi : v2 (`modules-v2/stock/*`) couvre uniquement entrepôts, inventaires, matières premières, mouvements, pièces rechange, produits finis. Legacy conserve : `tracabilite-lots/`, `fournitures/`, modules Odoo-style `stock/picking/location/lot/move/quant/warehouse/`. Fusion requise avant suppression.

### 3.2 Produits / Catalogue
Pourquoi : v2 (`modules-v2/produits/{familles,modeles,articles}` + `modules-v2/bom/*`) couvre 30 % du legacy. Legacy conserve : `articles-catalogue/`, `articles-generes/`, `parametres-catalogue/`, attributs §5. Fusion requise.

### 3.3 Fabrication
Pourquoi : v2 est un **complément §7** (postes atelier Ourdissage/Tissage/Coupe/Finition), pas un remplacement. Legacy OF/Machines/Maintenance/Gantt reste canonique.

---

## 4. Vérifications

- `cd frontend && npx tsc --noEmit` → **exit 0** après chaque consolidation et après la consolidation Ventes finale.
- Git : **113 fichiers backend supprimés** au total, aucun git commit par les agents (user review requise).
- Aucune route cassée dans App.tsx (routes legacy redirigées vers équivalents v2).

**Modules legacy restants dans `backend/modules/`** (ni supprimés ni ciblés par cette passe) :
- Non-doublons (utilitaires, pas d'équivalent v2 par design) : `ai`, `audit`, `auth`, `base`, `communication`, `couts`, `database`, `documents`, `ecommerce`, `email`, `excel-import`, `messages`, `migration`, `mobile`, `multisociete`, `notifications`, `parametrage`, `portail-client`, `pos`, `project`, `reports`, `search`, `selecteurs-machines`, `settings`, `social-auth`, `utilisateurs`, `webhooks`, `whatsapp`, `commercial`, `crm` (ancien, désactivé), `dashboard`.
- **Fusion partielle** (v2 incomplet, à compléter en Phase E) : `articles`, `articles-catalogue`, `articles-generes`, `modeles`, `parametres-catalogue`, `bom`, `fournisseurs`, `fournitures`, `inventaires`, `inventory`, `entrepots`, `matieres-premieres`, `stock`, `tracabilite-lots`, `warehouse`, `of`, `mrp`, `production`, `machines`, `maintenance`, `planification-gantt`, `planning-dragdrop`, `qualite-avance`, `qualite-avancee`, `quality`, `sale`, `suivi-fabrication`, `taches`, `purchase`, `purchase-requests`.
- **Conservé par choix** (Option B pour §2.5) : `bons-retour`.

---

## 5. À faire après ce commit

1. **Audit frontend** : grep résiduel des imports `services/api.ts.*(hrEmployees|hrRecruitment|hrPayslips|payrollTunisia|accountMoves|accountingTunisia|bankReconciliation|relances|clients|soustraitants)Service` pour s'assurer que les pages continuent de compiler et fonctionner à l'exécution.
2. **Phase E (recommandée)** : compléter v2 pour Stock (tracabilite + fournitures), Produits (catalogue + attributs + BOM), Fabrication (OF + machines + Gantt), puis supprimer le legacy correspondant.
3. **Tests manuels** : parcours Clients → Devis → Commande → BL → Facture (chaîne complète ventes v2) avant déploiement.
4. **Supprimer** : `backend/src/server-Laptop-Sgh.js` et `backend/src/core/ModelRegistry-Laptop-Sgh.js` (snapshots laptop orphelins, non chargés mais référencent du code supprimé).

---

## 6. Fichiers modifiés principaux

- `frontend/src/services/api.ts` — repointage de 10+ services vers `/api/v2/*`.
- `frontend/src/App.tsx` — redirects `/soustraitants` et `/relances`.
- `frontend/src/pages/DashboardChefProduction.tsx` + `DashboardMagasinierSoustraitants.tsx` — appels soustraitance repointés.
- `frontend/src/components/erp/views/OperationsPanel.tsx` — ecritures comptables v2.
- `backend/src/server.js` — alias compat `/api/pointage` et `/api/hr/recruitments` + retrait `startRelancesScheduler()`.
- `backend/src/core/ModelRegistry.js` — retrait `AccountMove`.
- `backend/modules-v2/rh/{pointage,recrutement}/routes.js` — portage handlers legacy.
- `backend/modules-v2/crm/comptes/{routes.js,controller.js}` — shims catégories + types-commerciaux.
