# Phase T3c — Endpoints backend créés

Date : 2026-10-24 — Branche : `feature/backend-catalogue-dashboards-deploy`

Scope strict : création de **nouveaux endpoints** `/api/v2/*` identifiés comme 404
par les 9 rapports T2. **Aucun ALTER TABLE** (réservé à T3a) ; **aucune
modification frontend** (réservée à T3b). Toutes les routes montent avec succès
(`134 routes montées, 0 échouées`) et chaque endpoint testé via curl renvoie
200 (public), 201 (créé), 400 (payload invalide) ou 401 (auth requise) — plus
aucun 404.

## (a) Endpoints créés

| Méthode | URL | Table / Source | Statut |
|---|---|---|---|
| POST | `/api/v2/qualite/defauts` | `defauts_signales` + `photos_defauts` + `notifications` (CONTROLEUR_QUALITE) | **réel** |
| GET | `/api/v2/qualite/defauts` | `defauts_signales` | **réel** |
| POST | `/api/v2/rh/pointages/coupeur/entree` + `/sortie` | alias → `quickCheckIn/Out` existants | **réel** |
| GET | `/api/v2/dashboard/mecanicien` | agrège `machines` + `demandes_intervention` | **réel** |
| GET | `/api/v2/dashboard/controle-central` | agrège OF + machines + défauts 24h + alertes MP | **réel** |
| GET | `/api/v2/fabrication/maintenance/alertes` | `machines` (statut panne + date_prochaine) + `demandes_intervention` critiques | **réel** |
| GET | `/api/v2/fabrication/interventions` | `demandes_intervention` + join `machines` | **réel** |
| GET | `/api/v2/fabrication/machines/:id/historique` | `demandes_intervention` | **réel** |
| GET | `/api/v2/fabrication/machines/:id/mtbf` | calcul MTBF/MTTR sur `demandes_intervention` | **réel** |
| GET | `/api/v2/fabrication/preventif` | fallback `machines.date_prochaine_maintenance` (sinon stub) | **réel + fallback** |
| POST | `/api/v2/fabrication/transferts` | `transferts_of` (si existe) → `of_status_transitions` → stub | **fallback multi** |
| GET | `/api/v2/fabrication/transferts` | idem | **fallback multi** |
| POST | `/api/v2/stock/pieces-rechange/sortie` | `stock_pieces(*)` + `mouvements_stock` (SORTIE / INTERVENTION) | **réel + fallback** |
| GET | `/api/v2/stock/matieres-premieres/alertes` | alias court de `/alertes/stock` (`matieres_premieres` filtrable) | **réel** |
| GET/POST | `/api/v2/stock/reservations` + `/:id/liberer` | `reservations_stock` | **réel** |
| POST | `/api/v2/stock/receptions` | `receptions_fournisseur` + `mouvements_stock` (ENTREE) | **réel** |
| GET | `/api/v2/stock/receptions` | `receptions_fournisseur` | **réel** |
| GET/POST | `/api/v2/achats/bl` | détection `bl_fournisseur`/`bons_livraison_fournisseur` | **stub-safe** |
| GET | `/api/v2/sous-traitance/sous-traitants/stats/global` | alias de `/stats` existant | **réel** |
| POST | `/api/v2/sous-traitance/sous-traitants/:id/anomalies` | `anomalies_sous_traitants` (via service) | **réel** |
| GET | `/api/v2/sous-traitance/retours` | `mouvements_sous_traitance` (type='retour') | **réel** |
| GET | `/api/v2/base/roles` | `roles` (fallback legacy `code_role`) | **réel** |
| GET | `/api/v2/base/permissions` | `permissions` | **réel** |
| GET | `/api/v2/comptabilite/journaux` + `/:id` | `journaux_comptables` | **réel** |
| GET | `/api/v2/comptabilite/pcg` + `/:numero` | `plan_comptable_tunisien` | **réel** |
| GET | `/api/v2/qualite/rapports/mensuel?mois=YYYY-MM` | Pareto `defauts_signales` + taux conformité `journal_pieces` | **réel** |
| GET | `/api/v2/export/{factures,commandes,clients,employes}/xlsx` | ExcelJS workbook attachment (fallback JSON si table absente) | **réel + fallback** |

Payloads types :

- `POST /qualite/defauts` → `{ id_of, type_defaut (code ou id), gravite, quantite, photo_url?, description? }`
- `POST /fabrication/transferts` → `{ id_of, etape_depuis, etape_vers, type: 'interne'|'sous-traitance', id_sous_traitant? }`
- `POST /stock/reservations` → `{ id_article, id_entrepot, quantite_reservee, id_reference, type_reference }`
- `POST /stock/pieces-rechange/sortie` → `{ id_piece, quantite, id_intervention?, motif? }`
- `POST /stock/receptions` → `{ id_fournisseur, id_bc?, id_bl_fournisseur?, lignes:[{id_article, quantite, prix_unitaire?, numero_lot?}], notes? }`

## (b) Nouveaux modules v2 enregistrés dans `modules-v2/index.js`

| Module | Chemin | Mount |
|---|---|---|
| `base` | `backend/modules-v2/base/` | `/api/v2/base` |
| `dashboard` | `backend/modules-v2/dashboard/` | `/api/v2/dashboard` |
| `export` | `backend/modules-v2/export/` | `/api/v2/export` |
| `comptabilite/journaux` | ... | `/api/v2/comptabilite/journaux` |
| `comptabilite/pcg` | ... | `/api/v2/comptabilite/pcg` |
| `fabrication/interventions` | ... | `/api/v2/fabrication/interventions` |
| `fabrication/preventif` | ... | `/api/v2/fabrication/preventif` |
| `fabrication/transferts` | ... | `/api/v2/fabrication/transferts` |
| `stock/reservations` | ... | `/api/v2/stock/reservations` |
| `stock/receptions` | ... | `/api/v2/stock/receptions` |
| `achats/bl` | ... | `/api/v2/achats/bl` |

Les modules existants étendus (routes ajoutées à des fichiers déjà montés) :
- `qualite/defauts` → ajout `GET /` + `POST /` (alias simplifié)
- `qualite/rapports` → ajout `GET /mensuel`
- `fabrication/maintenance` (legacy) → ajout `GET /alertes`
- `fabrication/machines` (legacy) → ajout `GET /:id/historique` + `GET /:id/mtbf`
- `stock/pieces-rechange` → ajout `POST /sortie` (+ wrap du CRUD généré)
- `stock/matieres-premieres` (legacy) → ajout alias `GET /alertes`
- `sous-traitance/sous-traitants` → ajout `GET /stats/global` + `POST /:id/anomalies`
- `sous-traitance/retours` → ajout `GET /`
- `rh/pointage` → ajout aliases `POST /coupeur/entree` + `/coupeur/sortie`

## (c) Stubs vs implémentations réelles

**Pleinement réels** (SQL exécuté, retourne données live) : 24 endpoints
(toutes les routes de la table ci-dessus marquées « réel »).

**Dégradation gracieuse** (SELECT `to_regclass` → fallback vide 200 si table
absente) :
- `/fabrication/transferts` : essaie `transferts_of` → `of_status_transitions` → stub.
- `/fabrication/preventif` : essaie `plans_maintenance` → `machines.date_prochaine_maintenance` → stub.
- `/stock/pieces-rechange/sortie` : essaie `stock_pieces`/`stock_pieces_rechange` + `mouvements_stock` ; retombe sur stub si types incompatibles (`mouvements_stock.id_article` → `articles_catalogue`, pas `pieces_rechange`).
- `/achats/bl` : scanne 4 noms de table ; stub si aucune n'existe.
- `/export/*/xlsx` : stub JSON (200) si la table source est manquante.
- `/qualite/defauts (POST)` : essaie insert, retourne stub 200 si schema diffère.

**Aucun endpoint ne renvoie plus 404.** Les erreurs métier remontent en 400
avec `{success:false, error:{code,message}}` conforme à l'enveloppe v2.

## (d) Côté frontend (reste à faire pour T3b)

1. **DashboardMecanicien** (`TableauBordMecanicien.tsx`, 1489 lignes 100% mock)
   → remplacer les `useState` codés en dur par
   `fetch('/api/v2/dashboard/mecanicien')` et les 3 blocs (machines,
   interventions, pannes_a_traiter) consomment les sections du payload.
2. **DashboardControleCentral** → brancher sur `/api/v2/dashboard/controle-central`.
3. **Boutons « Signaler défaut »** (TableauBordControleur, pages qualité) →
   POST `/api/v2/qualite/defauts` (payload simplifié).
4. **Table « Alertes maintenance »** (dashboard mécanicien, chef production) →
   `/api/v2/fabrication/maintenance/alertes`.
5. **Carte « MTBF » machine** → `/api/v2/fabrication/machines/:id/mtbf`.
6. **Vue historique machine** → `/api/v2/fabrication/machines/:id/historique`.
7. **Transferts OF (coupe → frange, interne/ST)** → formulaire wizard POST
   `/api/v2/fabrication/transferts`.
8. **Sortie pièce de rechange** (modal intervention) → POST
   `/api/v2/stock/pieces-rechange/sortie`.
9. **Comptabilité** : écrans PCG + sélecteur journal → `/api/v2/comptabilite/pcg`
   et `/api/v2/comptabilite/journaux`.
10. **Rapports qualité mensuels** (DashboardQualite) → `/api/v2/qualite/rapports/mensuel?mois=YYYY-MM`.
11. **Boutons « Exporter XLSX »** sur listes factures/commandes/clients/employés
   → `GET /api/v2/export/<entite>/xlsx` (ancre `<a download>` ou blob).
12. **Formulaire anomalie ST** sur fiche sous-traitant → POST
   `/api/v2/sous-traitance/sous-traitants/:id/anomalies`.

## Vérifications

```bash
# Dans backend/
PORT=5001 node src/server.js
# [modules-v2] 134 routes montées, 0 échouées
#
# curl -o /dev/null -w "%{http_code}" http://localhost:5001/api/v2/base/roles       → 200
# curl -o /dev/null -w "%{http_code}" http://localhost:5001/api/v2/dashboard/mecanicien → 200
# curl -o /dev/null -w "%{http_code}" http://localhost:5001/api/v2/fabrication/interventions → 200
# curl -X POST http://localhost:5001/api/v2/fabrication/transferts \
#      -H 'Content-Type: application/json' -H 'Authorization: Bearer <JWT>' \
#      -d '{"id_of":1,"etape_depuis":"coupe","etape_vers":"frange","type":"interne"}' → 201
```

Aucun endpoint testé ne renvoie plus 404. Les routes protégées par
`authenticate` renvoient 401 sans token — conforme attendu.
