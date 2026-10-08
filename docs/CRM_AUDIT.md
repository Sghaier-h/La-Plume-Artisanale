# CRM & Clients — Audit initial (Phase A)

_Contrat de référence : `docs/domain.md` §3 (lignes 365-475)._

## État initial (avant chantier)

### Backend
| Table §3 | Schéma SQL | Module v2 |
|---|---|---|
| §3.1 `comptes` | `database/schema-v2/03_crm.sql:10` | ✓ `backend/modules-v2/crm/comptes/` |
| §3.2 `contacts` | `03_crm.sql:54` | Sous-collection dans `comptes` (endpoints `POST /comptes/:id/contacts`) mais pas d'endpoint racine `/contacts` |
| §3.3 `adresses_client` | `03_crm.sql:80` | Sous-collection dans `comptes` uniquement |
| §3.4 `leads` | **Absent** (legacy `pistes_crm` ≠ contrat) | Absent |
| §3.5 `interactions` | `historique_commercial` mixte (événements + interactions) | Absent |
| §3.6 Machine d'états | Journal via `historique_commercial` | Partiel (`comptes/service.js:update`) |
| Référentiels ParamCrm | **Absents** (sources, motifs, catégories) | Absent |

### Frontend
| Page | État initial |
|---|---|
| `Clients.tsx` | Colorisation hardcodée (`bg-white`, `bg-gray-50`), formulaire long-scroll, pas de KPI cliquables, `Eye` icon présente, appelle legacy `/clients` |
| `ClientDetails.tsx` | ✓ Onglets 6 déjà présents (ne pas retoucher) |
| `CrmLeads.tsx` | Utilise `/crm/opportunites` (mauvais endpoint), pas de design system |
| `Opportunities.tsx` | Utilise `/crm/opportunites` (404 à cette adresse), colorisation Tailwind par défaut |
| `PipelineVente.tsx` | Kanban statique, pas de drag&drop, endpoint 404 |
| `crm/Contacts.tsx` | **100 % mocks** avec `MOCK_CONTACTS` |
| `crm/Interactions.tsx` | **100 % mocks** avec `MOCK_INTERACTIONS` |
| `parametres/ParamCrm.tsx` | Mocks + fetch vers `/api/v2/parametres/crm/*` inexistants |

### Services frontend
- `services/api.ts` définit `crmLeadsService`, `crmOpportunitiesService`, `crmActivitiesService` sur les legacy `/crm/*`.
- Aucun service v2 dédié `crmApi.ts`.

## Décisions prises

1. **Créer 5 nouveaux modules v2** : `contacts/`, `adresses/`, `leads/`, `interactions/`, `opportunites/`, `parametres/`.
2. **Créer un module shared** `_shared/numerotation/` (renommé du préfixe `crm_` pour extensibilité Ventes/Achats/Fabrication).
3. **Créer les tables manquantes** :
   - `leads` (§3.4 · pas de mapping possible vers `pistes_crm` legacy)
   - `interactions_crm` (§3.5 · dissocié de `historique_commercial` qui garde les événements système)
   - `crm_sources_leads`, `crm_motifs_perte`, `crm_categories_clients`
   - `config_numerotation` (générique)
   - `crm_config_devises`
4. **Écrire des seeds SQL idempotents** (>170 lignes de données démo Tunisie/France/Allemagne).
5. **Script `seed:demo`** exécute tous les .sql du dossier via `pg` client (transactions par fichier).
6. **Frontend** : supprimer les `MOCK_*` et brancher `crmApi.ts` sur les endpoints v2.
7. **Page dédiée** `/clients/nouveau` et `/clients/:id/edit` avec wizard 4 onglets (`ClientForm.tsx`).

## Gaps restants / à faire ultérieurement (non bloquants)

- **Wizard client** : validation en temps réel + toast d'erreur inter-onglets (les erreurs sont recalculées à la soumission).
- **Drawer volant** (`ClientDetailsDrawer.tsx`) demandé en fin de mission — non implémenté (row-click vers `/clients/:id` reste, comme dans le brief initial).
- **Filtres side-sheet** avec chips actifs — le panneau filtres existant reste inline (fonctionnel mais moins riche).
- **Modification prix multi-devises côté ventes** (devis, commandes…) — seul le champ `devise` est propagé au compte, pas encore hérité automatiquement dans les documents de vente existants.
- **Drag&drop kanban** avec probabilité automatique par stage — l'implémentation actuelle permet le déplacement via drag mais n'ouvre pas de modal pour le motif de perte.
