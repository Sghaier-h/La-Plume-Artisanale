# T2 — Rapport simulation COUPEUR (tablette atelier)

Compte testé : `coupeur@entreprise.local / DevLocal2024!`  (role `COUPEUR`, kiosque strict §14quater.14).
Backend `http://localhost:5000` + Frontend `http://localhost:3000` opérationnels.

## Routing & kiosque — incohérence majeure

- Login COUPEUR → `/dashboard-post-coupe` (`HOME_ROUTE_BY_ROLE.COUPEUR` dans `App.tsx` + `TabletteLayout.tsx`).
  Or `DashboardPostCoupe.tsx` est **view-only** : KPIs Recharts, tableaux `useState` mockés, aucun bouton Démarrer/Terminer/Scan/Transfert.
- L'écran de travail réel `TabletteCoupeur.tsx` (`/tablette/coupeur`) existe mais **n'est pas** dans `HOME_ROUTE_BY_ROLE` ni dans `UserBar.MENU_PAR_ROLE.COUPEUR` (menu = seulement `/dashboard-post-coupe`).  → Le coupeur n'a **aucun lien visible** vers son propre poste.

## Bugs bloquants (CRIT)

1. `GET /api/taches/operateur/:id/day` → **404**. `TabletteCoupeur` l'appelle à chaque mount : la liste "Mes tâches de coupe" est donc toujours vide. Les boutons Démarrer/Terminer ne peuvent jamais apparaître.
2. `PUT /api/taches/:id/demarrer` et `.../terminer` → **404**. Même si une tâche remontait, le clic échoue avec `alert('Erreur démarrage')`.
3. `POST /api/v2/stock/tracabilite-lots/coupe` : le backend exige `id_suivi` (`"id_suivi requis"`), mais le payload de `handleCreerLotCoupe()` ne l'envoie **jamais** → création de lot de coupe systématiquement en échec.
4. `GET /api/v2/sous-traitance/bons` → **500 SQL** `column ost.id_soustraitant does not exist` → le magasinier ST ne peut pas être notifié depuis le workflow coupe.

## Fonctionnalités manquantes (B)

- Aucune UI "**interne vs sous-traitant**" pour frange / nouage / pliage. Pas de bouton "Envoyer vers étape suivante", pas de choix d'atelier/ST. Aucune route backend `/api/v2/fabrication/transferts` (404).
- Pas de saisie **quantité réellement coupée vs théorique**, ni **1er choix / 2ème choix / déchets / chutes** sur la tablette (ces KPIs existent uniquement en lecture dans le dashboard).
- Pas de bouton **"Signaler défaut"** ; pas d'endpoint `/api/v2/qualite/defauts` (404). Impossible donc de reporter plusieurs défauts par lot.
- Pas de **pointage entrée/sortie** sur `TabletteCoupeur` ; `/api/v2/pointages` renvoie 404.
- Pas de marqueur "OF coupe terminée" explicite (le `handleTerminer` termine la *tâche* opérateur, pas l'OF ni l'étape coupe).
- Filtre tâches côté client (`type_tache.includes('coupe')`) : si `type_tache` est null, aucune tâche n'est retenue même si l'API fonctionnait.

## UX / §14ter.18 (A)

- "Scan QR" = simple `<input type=text>` manuel, aucune ouverture caméra réelle alors que le libellé affiche l'icône `Camera` → induit en erreur.
- Pas de **compteur +1 / +10 / −1** pour la quantité (seule la frappe au clavier numérique est possible), alors que les gants d'atelier rendent la saisie imprécise.
- Boutons principaux (`btnPrimary` 48 px) : passables mais pas assez contrastés en mode clair; l'input QR 56 px est OK.
- `alert()` natif bloquant pour les erreurs ("Lot introuvable", "Erreur démarrage") au lieu de toast tablette.
- Scan QR vide → `GET /qr/` renvoie 404 brut (aucun garde-fou front : si l'opérateur appuie trop vite, pas de feedback utile).
- Dashboard `/dashboard-post-coupe` : **4 OF mockés** (`OF246533`, `CA250469`, etc.) visibles même quand la base est vide — risque de confusion lors des démos.
- Nombre de clics décision interne / ST : actuellement **impossible** (aucun contrôle) → ∞.

## Bugs mineurs (MIN)

- `btnPrimary` défini deux fois dans `DashboardPostCoupe.tsx` (ligne 197 + export mort via `_btnPrimary`) → dette lint.
- `TabletteCoupeur` branche `socket.on('tache:new')` mais la source n'émet jamais (route taches 404).
- Historique saisies et "Étiquettes en attente" sont des `useState` figés : pas d'API `/etiquettes` ni `/saisies`.

Priorité conseillée : (1) rebrancher `/api/taches/operateur/:id/day` + verbes démarrer/terminer, (2) corriger payload lot-coupe (`id_suivi`), (3) ajouter workflow "transfert étape suivante" avec choix interne/ST, (4) ajouter saisie quantités + défauts + pointage sur `/tablette/coupeur`, (5) mettre `/tablette/coupeur` comme home COUPEUR et l'exposer dans UserBar.
