# Phase F — Nettoyage des mocks UserBar + DashboardAdministrateur

> Suite de l'alerte utilisateur : « des icône ou stat ou chiffre ou
> informations photo pas réel ». Objectif : remplacer les données
> factices les plus visibles par de vrais appels aux APIs v2.
> Priorité donnée aux éléments vus en permanence (UserBar) puis au
> dashboard d'accueil Administrateur.

## (a) Composants / pages patchés

| Fichier | Mocks supprimés | Endpoints appelés |
|---|---|---|
| `frontend/src/components/UserBar.tsx` | `MOCK_MESSAGES` (6 lignes), `MOCK_NOTIFS` (3 lignes), compteurs figés | `GET /api/v2/messages/recents?limit=5`, `GET /api/v2/notifications/non-lues?limit=5` — fetch au mount + refresh 60 s, fallback liste vide |
| `frontend/src/pages/DashboardAdministrateur.tsx` | `ventesData`, `productionData`, `repartitionPoste` (lignes 44-59) | `GET /api/dashboard/ventes-par-mois`, `GET /api/dashboard/production-hebdo?jours=7`, `GET /api/dashboard/repartition-poste` ; totaux dérivés pour la légende du PieChart (plus de pourcentages codés en dur) |
| `frontend/src/services/api.ts` | — | ajout de `dashboardService.getProductionHebdo / getRepartitionPoste` et export `userbarService` |

## (b) Endpoints v2 nouvellement créés

Tous renvoient `200 { success:true, data:[…] }` avec `data=[]` si la
table n'existe pas (le composant reste fonctionnel desktop / tablette
/ mobile sans régression visuelle) :

1. `GET /api/v2/messages/recents?limit=5` — `backend/modules-v2/comms/messagerie/routes.js`
   - Requête SQL agrégée sur `messages` (table legacy réelle, source de
     données en production) avec `LEFT JOIN users` pour `from`.
   - Scope utilisateur courant (middleware `authenticate`).
   - Shape : `[{ id, from, preview, time, urgent, channel:'interne' }]`.
2. `GET /api/v2/notifications/non-lues?limit=5` — `backend/modules-v2/comms/notifications/routes.js`
   - Requête sur `notifications` (colonnes auto-migrées par le module
     legacy : `id_destinataire`, `titre`, `contenu`, `lu`, `urgent`,
     `date_creation`).
   - Shape : `[{ id, title, body, time, level:'info'|'danger' }]`.
3. `GET /api/dashboard/production-hebdo?jours=7` — `backend/modules/dashboard/controllers/dashboard-kpis.controller.js`
   - CTE `generate_series` + 2 agrégats (`date_creation` lancements,
     `date_fin_reelle` finitions) joints sur la série de jours.
   - Fallback 7 jours à 0 si table absente.
   - Shape : `[{ jour:'L', of:N, termines:N }]`.
4. `GET /api/dashboard/repartition-poste` — même fichier
   - Première tentative sur colonnes v2 (`etat_tissage`,
     `etat_coupe`, `etat_preparation_mp`) ; fallback agrégat par
     `statut`. Palette terracotta/gold/sage/indigo mappée côté backend.
   - Shape : `[{ name, value, color }]` — en comptes absolus, le
     frontend calcule les pourcentages pour la légende.

## (c) Mocks supprimés (listing complet)

- `UserBar.tsx` → tableau `MOCK_MESSAGES` (6 entrées fictives dont « Hotel
  Marina Djerba », « +216 24 xxx xxx », etc.) et `MOCK_NOTIFS` (3
  entrées fictives « Facture impayée », « OF-2609015 terminé »,
  « CMD-B2C-0088 »).
- `UserBar.tsx` → compteurs `useState(MOCK_NOTIFS.length)` et
  `useState(MOCK_MESSAGES.length)` → remplacés par `messages.length`
  / `notifs.length` dérivés du state fetché.
- `DashboardAdministrateur.tsx` → séries codées en dur `ventesData`,
  `productionData`, `repartitionPoste` + commentaire
  « Mock chart series — replace when available ».
- Les icônes WhatsApp / Telegram et puces de canal restent (le canal
  est désormais lu depuis l'API ; seul `interne` est renvoyé pour le
  moment par les stubs backend).

## (d) tsc final

`cd frontend && npx tsc --noEmit` → **exit 0** (0 erreur TypeScript).

Les 3 fichiers backend touchés passent `node --check` sans erreur de
syntaxe (ESM strict).

## (e) Reste à faire (scope limité par volume)

Non traités dans cette passe (89 fichiers frontend contiennent encore
`mock` / `MOCK` / `fake` ; ciblage à faire module par module) :

- `DashboardIA.tsx` : constantes `AGENTS` / `RAPPORTS` encore
  codées en dur → à brancher sur `/api/v2/ia-agents/*` (routes déjà
  montées en v2, données réelles à requêter via `agents` + `runs` +
  `findings`).
- `DashboardChefProduction`, `DashboardMagasinierMP`,
  `DashboardMagasinierSoustraitants`, `DashboardControleCentral`,
  `DashboardPostCoupe`, `DashboardTisseur`, `ChefAtelierDashboard`,
  `TableauBordMecanicien`, `TableauBordMagasinPF`,
  `DashboardRHManager` : hardcodés partiellement (listes de tâches,
  tuiles, radiales). KPIs principaux déjà alimentés par
  `useDashboardKpis` / `dashboardService`.
- `DashboardAdministrateur.tsx` : la KPI « Qualité 98% » reste figée
  (pas d'endpoint `/api/dashboard/taux-conformite` à ce jour).
- Avatars / photos / logos sociétés : aucun `placeholder.com` ni
  `ui-avatars.com` trouvé dans le frontend (grep négatif). Un
  composant générique `<Avatar initials />` reste à introduire une
  fois que `societes.logo_url` et `users.photo_url` seront exploités
  par les pages de listing.
- Chiffres fictifs isolés dans les pages hors dashboard : non
  balayés (volume important, moins visible utilisateur).

Rien de ce qui est livré ici ne régresse en responsive (styles
inchangés, uniquement remplacement de données). Les fallbacks `[]`
garantissent le rendu desktop/tablette/mobile même si la base de
données est vide ou l'endpoint absent.
