# CRM & Clients — Finalisation §3

_Branche : `feature/backend-catalogue-dashboards-deploy`. Aucune modification committée par l'agent — l'utilisateur reviewe puis committe manuellement._

## Phase A — Audit
Voir `docs/CRM_AUDIT.md`.

## Phase B — Backend (nouveaux modules v2)

### SQL
- `database/schema-v2/03b_crm_leads_interactions.sql` : nouvelles tables `leads`, `interactions_crm`, `crm_sources_leads`, `crm_motifs_perte`, `crm_categories_clients`, `comptes_categories`.
- `database/schema-v2/03c_config_numerotation_devises.sql` : `config_numerotation` (générique — extensible à Ventes/Achats/Fabrication) + `crm_config_devises` + ALTER TABLE `comptes` pour colonnes commerciales (devise, plafond_credit, delai_paiement, mode_paiement_prefere, escompte_regl_anticipe, penalites_retard…).

### Modules v2 créés (`backend/modules-v2/crm/*/`)
- `contacts/` : CRUD racine + filtre `?id_client=` + règle 1 principal max/compte (auto-décoche les autres).
- `adresses/` : CRUD racine + filtre `?id_client=` + règle 1 défaut facturation + 1 défaut livraison max.
- `leads/` : CRUD + `POST /:id/convertir` transactionnel (crée compte statut=lead, contact principal, journal).
- `interactions/` : CRUD + filtre `id_client|id_lead|id_contact|type|direction|suivi_en_retard`.
- `opportunites/` : CRUD + `GET /stats` (total, actives, gagnées, perdues, CA prévisionnel).
- `parametres/` : CRUD `sources-leads|motifs-perte|categories-clients|devises` + `GET/PUT/POST /numerotation/:entite[/preview]`.

### Shared
- `backend/modules-v2/_shared/numerotation/model.js` + `service.js` : générateur atomique (SELECT FOR UPDATE), reset annuel/mensuel/jamais, tokens `{YYYY}` `{YY}` `{MM}` `{YYYYMM}` `{SEQ:N}`.
- `backend/modules-v2/crm/comptes/service.js` mis à jour :
  - Utilise `nextNumerotation('client')` puis fallback legacy `nextNumero`.
  - `create()` accepte payload cascade `{compte, contacts:[], adresses:[]}` en transaction.
  - Ajout de `stats()`.
  - Nouveau filtre `type_compte|pays|actif` sur `list()`.

### Enregistrement
`backend/modules-v2/index.js` : groupe CRM enrichi avec `contacts, adresses, leads, interactions, opportunites, parametres`. Alias URL `parametres` ajouté.

### Seeds démo (`backend/seeds/crm-clients/`)
Fichiers idempotents (ON CONFLICT / DELETE + INSERT sur marqueurs `.demo.tn`/`DEMO ·`/etc.) :
- `00_schema.sql` — DDL autonome des tables §3.
- `01_comptes.sql` — 20 comptes (LP/AF/FT, société/particulier, TN/FR/DE, statuts lead/prospect/client/archive, matricules réalistes).
- `02_contacts.sql` — 32 contacts avec règle 1 principal par compte.
- `03_adresses.sql` — 26 adresses (facturation + livraison, multi-adresses pour hôtels et grossistes).
- `04_leads.sql` — 15 leads (canaux variés, statuts nouveau/en_traitement/converti/perdu, motifs de perte).
- `05_interactions.sql` — 50 interactions (appel/email/whatsapp/rdv/note × entrant/sortant/interne).
- `06_categories_clients.sql` — 7 catégories (VIP, EXPORT_UE, B2B, HOTEL, REVENDEUR, E_COMMERCE, PARTICULIER).
- `07_sources_leads.sql` — 11 sources (SITE_WEB, SALON_TEXFAIR, RECOMMANDATION, INSTAGRAM, FACEBOOK_ADS…).
- `08_motifs_perte.sql` — 9 motifs (PRIX_ELEVE, DELAI_TROP_LONG, CONCURRENT…).
- `09_config_numerotation_devises.sql` — 10 configs numérotation (client/contact/lead/opportunite/interaction/devis/commande/bl/facture/avoir) + 5 devises (TND/EUR/USD/GBP/CHF).
- `10_opportunites.sql` — 15 opportunités (5 étapes du pipeline, montants réalistes, cross-ref via `code_client`).

### Script d'injection
`backend/scripts/seed-demo.js` + `backend/package.json` : nouveaux scripts `seed:demo` et `seed:demo:dry`.
```
cd backend
npm run seed:demo:dry   # liste les fichiers
npm run seed:demo       # exécute tout
```
Chaque fichier est joué dans une transaction propre — si un échoue, seul lui rollback (log erreur, continue les autres). `SEED_STRICT=true` fait échouer tout.

## Phase C — Frontend

### Nouveau service
`frontend/src/services/crmApi.ts` : namespaces `comptesApi`, `contactsApi`, `adressesApi`, `leadsApi`, `interactionsApi`, `opportunitesApi`, `paramCrmApi` + helpers `pickData`, `pickPagination`.

### Utilitaires
`frontend/src/utils/formatters.ts` : `fmtMoney(montant, devise)` (respecte les décimales du catalogue devise) + `fmtInt`, `fmtDate`, `fmtDateTime`, `fmtRelative`.

### Pages refactorées
| Fichier | Changements majeurs |
|---|---|
| `crm/Contacts.tsx` | Mocks supprimés → `contactsApi.list()`. `DashboardShell` + KPI cliquables (Total / Principaux / Actifs / Sans email). Recherche debounced 250 ms + filtre rôle + croix clear. |
| `crm/Interactions.tsx` | Mocks supprimés → `interactionsApi.list()`. KPI cliquables (Aujourd'hui / Cette semaine / Ce mois / Suivi en retard). Filtre type + recherche. |
| `CrmLeads.tsx` | Endpoint corrigé (`leadsApi.list`). Bouton "Convertir" appelle `POST /leads/:id/convertir`, redirige vers le compte créé. |
| `Opportunities.tsx` | Endpoint corrigé (`opportunitesApi.list` + `stats`). KPI cliquables Total/Actives/Gagnées + CA prévisionnel. Lien vers vue kanban. |
| `PipelineVente.tsx` | Kanban 6 colonnes (Nouveau, Qualification, Proposition, Négociation, Gagné, Perdu) avec drag&drop natif HTML5. Chaque déplacement fait `PUT /opportunites/:id` (etape/statut/probabilite). |
| `parametres/ParamCrm.tsx` | Réécrit sur `paramCrmApi` (fetch + CRUD réels). Nouvelles sections : Devises, Numérotation configurable (édition inline format + reset_period). |
| `Clients.tsx` | KPI passés sur design-system `KpiCard` avec `onClick` (filtres actifs `all|actifs|inactifs|prospects`). Bouton "+ Nouveau" navigue vers `/clients/nouveau`. Row-click reste vers `/clients/:id`. Bouton edit navigue vers `/clients/:id/edit`. Table/thead/tbody utilisent CSS vars (fin des hardcoded `bg-white`, `bg-gray-*`, badges via `color-mix`). Icône `Eye` retirée de l'action catalogue. |

### Nouveau composant page
`frontend/src/pages/ClientForm.tsx` — wizard 4 onglets (Société / Contacts / Adresses / Conditions commerciales) :
- Icônes Lucide `Building2`, `Users`, `MapPin`, `CreditCard`.
- Bouton "Enregistrer" persistant dans le `headerRight` (visible depuis tous les onglets).
- Validation locale (retourne les erreurs par onglet, badges rouges à venir).
- Contact principal en radio (contrainte unique auto).
- Payload cascade unique `POST /v2/crm/comptes` avec `contacts:[]` et `adresses:[]`.
- Édition (`/clients/:id/edit`) précharge le compte via `GET /v2/crm/comptes/:id`.

### Routes ajoutées (`App.tsx`)
- `/clients/nouveau` → `<ClientForm mode="create" />`
- `/clients/:id/edit` → `<ClientForm mode="edit" />`

## Phase D — Paramètres CRM
Voir `ParamCrm.tsx` — 4 sections CRUD (Sources, Motifs, Catégories, Devises) + numérotation configurable.

## Tests curl (à exécuter après `npm run seed:demo`)
```
# Auth (via /api/v2/auth/login)  → récupérer $TOKEN
export TOKEN="Bearer <JWT>"

# Comptes
curl -H "Authorization: $TOKEN" http://localhost:5000/api/v2/crm/comptes
curl -H "Authorization: $TOKEN" http://localhost:5000/api/v2/crm/comptes/stats

# Contacts (filtre par compte)
curl -H "Authorization: $TOKEN" "http://localhost:5000/api/v2/crm/contacts?id_client=1"

# Adresses
curl -H "Authorization: $TOKEN" "http://localhost:5000/api/v2/crm/adresses?id_client=1"

# Leads
curl -H "Authorization: $TOKEN" http://localhost:5000/api/v2/crm/leads
curl -H "Authorization: $TOKEN" -X POST http://localhost:5000/api/v2/crm/leads/1/convertir

# Interactions
curl -H "Authorization: $TOKEN" "http://localhost:5000/api/v2/crm/interactions?suivi_en_retard=true"

# Opportunités
curl -H "Authorization: $TOKEN" http://localhost:5000/api/v2/crm/opportunites
curl -H "Authorization: $TOKEN" http://localhost:5000/api/v2/crm/opportunites/stats

# Paramètres
curl -H "Authorization: $TOKEN" http://localhost:5000/api/v2/crm/parametres/sources-leads
curl -H "Authorization: $TOKEN" http://localhost:5000/api/v2/crm/parametres/devises
curl -H "Authorization: $TOKEN" http://localhost:5000/api/v2/crm/parametres/numerotation
curl -H "Authorization: $TOKEN" -X POST -H "Content-Type: application/json" \
     -d '{}' http://localhost:5000/api/v2/crm/parametres/numerotation/client/preview
```

## Verdict qualité

- `npx tsc --noEmit` (depuis `frontend/`) : **exit 0** (aucune erreur TypeScript).
- Design system : `DashboardShell` + `KpiCard` + `SectionCard` utilisés sur toutes les pages CRM sauf `Clients.tsx` (retouches ciblées — reste des styles Tailwind résiduels dans le formulaire long-scroll et la vue catalogue, à remplacer une fois `ClientDetailsDrawer` implémenté ; le nouveau flux passe par `/clients/nouveau` qui remplace le modal).

## Écarts / décisions

1. **`historique_commercial` conservé** pour les événements système (création, changement_statut, archivage). `interactions_crm` reçoit les échanges opérationnels §3.5 — approche complémentaire au contrat qui ne se contredit pas.
2. **Wizard client :** demandé "modal" puis "route dédiée" puis "wizard 4 onglets" → implémentation route dédiée avec 4 onglets + bouton "Enregistrer" dans le header (persistant). Footer sticky non ajouté (le header du DashboardShell fait office). Badge rouge par onglet côté validation à améliorer.
3. **`ClientDetailsDrawer` non implémenté** — brief tardif, row-click reste vers `/clients/:id`.
4. **Filtres side-sheet non implémentés** — panneau filtres existant sur `Clients.tsx` reste inline. À convertir en drawer latéral dans un chantier suivant.
5. **Multi-devises documents ventes** — schéma prévu (`crm_config_devises`, colonne `devise` sur `comptes`) mais les pages Devis/Commandes/Facture ne consomment pas encore automatiquement la devise du compte. Composant `DeviseSelector.tsx` non créé.
6. **Numérotation configurable** — service backend prêt et branché sur `comptes`. À câbler également côté contacts/leads/opportunités/interactions dans un chantier suivant (les tables sont créées avec les configs par défaut mais l'appel `nextNumerotation()` n'est fait que dans `comptes/service.js`).
7. **Tests Jest** — pas ajoutés (hors périmètre du brief).

## Fichiers créés / modifiés

### Backend
- `database/schema-v2/03b_crm_leads_interactions.sql` (nouveau)
- `database/schema-v2/03c_config_numerotation_devises.sql` (nouveau)
- `backend/modules-v2/_shared/numerotation/{model,service}.js` (nouveau)
- `backend/modules-v2/crm/contacts/{model,service,controller,routes,manifest}.js` (nouveau)
- `backend/modules-v2/crm/adresses/{model,service,controller,routes,manifest}.js` (nouveau)
- `backend/modules-v2/crm/leads/{model,service,controller,routes,manifest}.js` (nouveau)
- `backend/modules-v2/crm/interactions/{model,service,controller,routes,manifest}.js` (nouveau)
- `backend/modules-v2/crm/opportunites/{model,service,controller,routes,manifest}.js` (nouveau)
- `backend/modules-v2/crm/parametres/{model,service,controller,routes,manifest}.js` (nouveau)
- `backend/modules-v2/crm/comptes/{model,service,controller,routes}.js` (modifiés — cascade, stats, filtres)
- `backend/modules-v2/index.js` (ajout des modules crm)
- `backend/seeds/crm-clients/*.sql` (10 fichiers seed)
- `backend/scripts/seed-demo.js` (nouveau)
- `backend/package.json` (scripts `seed:demo`)

### Frontend
- `frontend/src/services/crmApi.ts` (nouveau)
- `frontend/src/utils/formatters.ts` (nouveau)
- `frontend/src/pages/ClientForm.tsx` (nouveau, wizard 4 onglets)
- `frontend/src/pages/Clients.tsx` (KPI cliquables, routes navigate, palettes CSS vars)
- `frontend/src/pages/CrmLeads.tsx` (réécrit, bouton convertir)
- `frontend/src/pages/Opportunities.tsx` (réécrit, KPI + stats)
- `frontend/src/pages/PipelineVente.tsx` (réécrit, drag&drop)
- `frontend/src/pages/crm/Contacts.tsx` (réécrit, mocks supprimés)
- `frontend/src/pages/crm/Interactions.tsx` (réécrit, mocks supprimés)
- `frontend/src/pages/parametres/ParamCrm.tsx` (réécrit, sections devises + numérotation)
- `frontend/src/App.tsx` (routes /clients/nouveau, /clients/:id/edit)

### Docs
- `docs/CRM_AUDIT.md` (nouveau)
- `docs/CRM_FINALISATION.md` (ce fichier)
