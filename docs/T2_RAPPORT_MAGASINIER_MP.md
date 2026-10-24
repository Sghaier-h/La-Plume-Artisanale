# T2 — Rapport MAGASINIER_PREPARATION (MP)

**Date** : 2026-10-24
**Compte** : `magasinier.mp@entreprise.local` → rôle `MAGASINIER`, dashboard `magasinier-mp`
**Permissions** : `stock:*`, `mouvement:creer`, `inventaire:modifier`, `reservation:gerer`, `preparation_mp:consulter`

## 1. Résumé exécutif

Login OK, dashboard chargé (`/dashboard-magasinier-mp`). **Mais le dashboard reste à ~80 % mock** : les 5 onglets (Machines / Préparation / Stock / Transferts / Retours) affichent des OF, QR, lots et poids hardcodés. Seule la liste des OF (`ofService.getOFs`) et la projection stock par entrepôt (`/par-entrepot`) sont réellement hydratées — et renvoient aujourd'hui `[]`. Les workflows métier critiques du magasinier MP (réception BL fournisseur, alertes, scan QR, approvisionnement) ne sont pas câblés.

## 2. Résultats par scénario

| # | Scénario | Endpoint testé | Résultat |
|---|----------|----------------|----------|
| 1 | Dashboard MP | `/dashboard-magasinier-mp` | OK (visuel), KPI alertes = mock |
| 2 | Lister MP stock | `GET /api/v2/stock/matieres-premieres` | OK (6 MP DEMO, `stock_actuel="0"`, aucune donnée fournisseur/seuil) |
| 2b | Stock par entrepôt | `GET /api/v2/stock/matieres-premieres/par-entrepot?seuilBas=true` | OK vide (`{lignes:[]}`) |
| 3 | Réception BL fournisseur | `GET /api/v2/achats/bl`, `/api/v2/stock/receptions`, `/api/v2/catalogue/fournisseurs` | **404 — ENDPOINTS INEXISTANTS** |
| 4 | Voir BOM OF | `GET /api/v2/catalogue/articles/nomenclatures` | **404**. `/api/v2/fabrication/mrp/boms` existe mais BOMs `product_id=null`, `line_count="0"` (coquille vide) |
| 5 | Sortie MP → machine | `POST /api/v2/stock/mouvements` | **BUG SQL : `column "numero_mouvement" of relation "mouvements_stock" does not exist` (code 42703)** |
| 6 | Inventaire ponctuel | `GET /api/v2/stock/inventaires` OK (vide) ; `POST {}` | **Erreur SQL brute `23502 id_entrepot null`** remontée au client (pas de validation) |
| 7 | Alertes stock critique | `GET /api/v2/stock/matieres-premieres/alertes` | **404** |
| 8 | Retours MP non utilisée | — | Pas d'endpoint, UI mock pur (`retoursMatieres` statique) |

## 3. Bugs / manques §14ter.18

- **Bug SQL mouvements** : colonne `numero_mouvement` manquante → aucune sortie MP ne peut être enregistrée en base. Workflow magasinier bloqué dès l'étape 5.
- **Bug validation inventaire** : erreur Postgres 23502 remontée telle quelle (`null value in column "id_entrepot"...`). Pas de message métier, pas de 400 propre.
- **Endpoints manquants** (tous retournent 404) : `/api/v2/achats/bl`, `/api/v2/stock/receptions`, `/api/v2/catalogue/fournisseurs`, `/api/v2/catalogue/types-mp`, `/api/v2/catalogue/articles/nomenclatures`, `/api/v2/stock/matieres-premieres/alertes`, `/api/v2/stock/reservations`, `/api/v2/stock/scan/:code`.
- **Mocks persistants** `DashboardMagasinierMP.tsx` : `preparationsEnCours`, `stockMP`, `transfertsEnAttente`, `retoursMatieres` restent hardcodés (Phase F2 incomplète). Les champs métier clé (sélecteurs, besoins fil, QR MP) n'ont aucun back équivalent.
- **Données MP vides** : 6 fiches `[DEMO]` avec `id_type_mp`, `id_fournisseur`, `stock_minimum`, `stock_alerte` tous à `null` → aucune alerte calculable.

## 4. Points d'attention — réponses

- **Scan QR/code-barres** : non implémenté (ni endpoint, ni composant frontend ScanBarcode). Saisie manuelle obligatoire.
- **BOM d'un OF en 1 clic** : non. Aucun endpoint `GET /of/:id/bom`, les sélecteurs sont inventés côté front.
- **Sortie MP = MAJ auto stock** : impossible aujourd'hui (bug SQL + absence liaison OF↔mouvement).
- **Alertes stock bas actionnables** : non — pas d'endpoint `/alertes` ni de bouton "Commander fournisseur".
- **Batch picking multi-OF** : absent (UI = 1 OF déplié à la fois, aucun endpoint lot).

## 5. Recommandations prioritaires

1. Corriger migration `mouvements_stock` (`numero_mouvement`) — bloque toute sortie MP.
2. Créer les endpoints Réception BL (`/api/v2/achats/bl`), Alertes MP, BOM-par-OF, Scan QR.
3. Nettoyer les 4 blocs de mocks `DashboardMagasinierMP.tsx` et câbler sur APIs réelles.
4. Normaliser les erreurs validation (plus de SQLSTATE brut vers le client).
5. Peupler `stock_alerte` / `stock_minimum` / `id_fournisseur` dans `matieres_premieres`.

*Fin — ~470 mots.*
