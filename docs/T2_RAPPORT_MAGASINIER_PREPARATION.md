# T2 — Rapport MAGASINIER_STOCK (préparation / colisage / expédition)

**Date** : 2026-10-24  
**Compte testé** : `magasinier.stock@entreprise.local` (id=11, rôle `MAGASINIER_STOCK`, `dashboardsAttribues: ["magasin-pf"]`)  
**Dashboard** : `/tableau-bord-magasin-pf` → `frontend/src/pages/TableauBordMagasinPF.tsx`

## Scénarios joués

| # | Scénario | Résultat |
|---|---|---|
| 1 | Dashboard magasin PF | OK — 7 onglets (Commandes, Colis, Pliage, Frange, Fournitures, Achats, Interventions) |
| 2 | Voir commandes à préparer (statut terminé) | KO — `/api/v2/ventes/commandes` renvoie 22 commandes toutes `en_attente`, aucun filtre statut "prêt à expédier" |
| 3a | Lignes à préparer / lots terminés | PARTIEL — dashboard hydrate uniquement via `/api/v2/fabrication/of` (états `tissage`); 5 autres étapes (Coupe, ST, Atelier, Pliage, Frange) restent en MOCK |
| 3b | Imprimer étiquettes | **MANQUE TOTAL** — aucun endpoint `/etiquettes`, `/labels`, `/print-labels` en backend |
| 3c | Marquer étiquetage terminé | MANQUE — pas de transition d'état |
| 4 | Pliage (coche manuelle) | MOCK (données en dur dans le composant) |
| 5 | Création colis | Partiel — `POST /api/v2/ventes/colis` fonctionne avec `{id_commande}` mais **BUG SQL** si on envoie `poids` (le modèle attend `poids_kg`, non documenté → erreur `column "poids" of relation "colis" does not exist`). Dashboard "Nouveau colis" **n'appelle pas** l'API, formulaire purement local |
| 6 | Liste colisage PDF (`/liste-colisage`) | **KO** — route frontend existe (App.tsx:1134, Navigation.tsx:177) mais **aucun endpoint back** (`GET /api/v2/ventes/colis/liste-colisage/:id` → 404) |
| 7 | Générer BL (`POST /api/v2/ventes/bl/from-commande/32`) | OK — BL créé (id=1, numéro `BL-202610-0001`, statut `brouillon`) |
| 8 | Imprimer BL (PDF) | **BUG 500** — `GET /api/v2/ventes/bl/1/pdf` → `column c.adresse does not exist` (bug `pdf.service.js/drawBL`) |
| 9 | Expédition (transporteur + tracking + `livrer`) | Partiel — route est `PUT /:id/livrer` (pas POST comme dit en mission); refusé si BL en `brouillon` → transition `valider→livrer` obligatoire mais pas de bouton UI. Aucune notification client déclenchée |
| 10 | Historique expéditions | KO — `/api/v2/ventes/bl` liste vide, pas de vue historique |

## UX §14ter.18 — manques détectés

- **QR produit fini pour scan rapide** : route `POST /colis/:id/scan` existe mais **non branchée** au dashboard; aucun lecteur QR intégré.
- **Impression étiquettes groupée** : inexistante (aucune route ni UI).
- **Liste colisage auto-calculée (poids total, nb colis)** : impossible — pas d'endpoint, poids colis null par défaut.
- **QR / numéro propre au colis** : numéro généré (`C002-BL0000-001`) mais pas de QR généré ni affichable.
- **BL 1-clic depuis commande** : endpoint OK mais **non appelé** depuis le dashboard magasin PF (bouton "Générer BL" absent de l'onglet Commandes).
- **Choix transporteur mémorisé par client** : aucune colonne `transporteur_prefere` sur `clients`, aucune logique de rappel.
- **Pas de notification client** à l'expédition (`notifications` vide, pas de hook sur `livrerBL`).

## Bugs confirmés (non corrigés)

1. **`GET /api/v2/ventes/bl/:id/pdf` → 500** : `column c.adresse does not exist` dans `backend/src/services/pdf.service.js` (`drawBL`/`fetchBLFull`). BL inimprimable.
2. **`POST /api/v2/ventes/colis` avec `poids`** : rejette → attendait `poids_kg`. Payload non documenté dans README.
3. **Route `/liste-colisage` frontend sans backend** : clic UI → page vide/404.
4. **BL `from-commande`** crée un BL avec `adresse_livraison: null` (la commande source n'avait pas d'adresse).
5. **Dashboard magasin PF à 85 % mock** : onglets Colis, Pliage, Frange, Fournitures, Achats, Interventions **tous** en données en dur, aucun fetch API.
6. **Mission dit `POST /api/v2/ventes/bl/from-commande/:id`** → OK, mais `livrer`/`valider`/`annuler` sont en **PUT** (incohérence verbe REST à documenter).

## Priorités

1. Fixer PDF BL (SQL `c.adresse`) — bloquant expédition.
2. Implémenter `GET /api/v2/ventes/colis/liste-colisage/:idCommande?format=pdf`.
3. Brancher le dashboard magasin PF sur `/api/v2/ventes/colis` + `/api/v2/ventes/bl` (fin des mocks).
4. Ajouter endpoint `POST /api/v2/produits-finis/:id/etiquette` (PDF/QR).
5. Hook notification client sur `livrerBL`.
6. Documenter payload colis (`poids_kg` vs `poids`) + README `/colis`.
