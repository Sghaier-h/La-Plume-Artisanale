# Module rh/primes-scores

Scores journaliers 5 critères pondérés (§11bis.7bis).
`score_global` est calculé par PostgreSQL (`GENERATED ALWAYS AS`) :

```
score_global = 0.30 × score_quantite
             + 0.25 × score_qualite
             + 0.15 × score_presence
             + 0.15 × score_absences
             + 0.15 × score_discipline
```

- **Table** : `primes_scores_journaliers`
- **Endpoint racine** : `/api/v2/rh/primes-scores`

## Endpoints

| Méthode | Route                                        | Description |
|---------|----------------------------------------------|-------------|
| GET     | `/`                                          | Liste (filtres `id_employe`, `date_journee`, `atelier`) |
| GET     | `/:id`                                       | Détail |
| GET     | `/employe/:id/semaine/:annee/:numero_semaine`| Cumul ISO-week d'un employé |
| POST    | `/`                                          | Crée / upsert manuel (UNIQUE `id_employe, date_journee`) |
| PUT     | `/:id`                                       | Modifie un score |
| DELETE  | `/:id`                                       | Supprime un score |
| POST    | `/bulk-calcul-journalier`                    | Recalcule tous les scores d'un atelier pour une journée |

## Bulk-calcul-journalier

Payload :
```json
{ "date_journee": "2026-09-24", "atelier": "tissage", "id_employes": [12, 34] }
```
- `id_employes` optionnel (par défaut : tous les employés `statut='actif'`).
- Sources agrégées :
  - `pointages.heures_travaillees` → `score_presence`
  - `pointages.heures_retard`     → `score_discipline`
  - `absences.type_absence`       → `score_absences`
  - `controles_qualite` (via `id_controleur`) → `score_qualite`
  - `defauts_signales`  (via `id_operateur`)  → pénalités qualité/discipline
- Les scores calculés sont bornés `[0,100]` puis **upsert** (`ON CONFLICT
  (id_employe, date_journee) DO UPDATE`).
- Les employés sans données du jour sont ignorés (pas de ligne à 0 parasite).
- `score_global` n'est jamais posté par l'API — la DB le régénère.

## Notes

- `score_quantite` reste un **placeholder** (100 si présent, 0 sinon) : cabler
  ultérieurement le rendement machine depuis `of_postes`/`enroulements` (TODO).
- La formule et la pondération sont figées côté DB (GENERATED). Pour changer
  la pondération, éditer `database/schema-v2/30_primes_rendement.sql`.
