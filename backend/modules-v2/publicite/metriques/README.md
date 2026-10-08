# publicite/metriques — Métriques pub journalières

**Table** : `metriques_pub_journalieres`
**Contrat** : `docs/domain.md §11quinquies.9`
**Route** : `/api/v2/publicite/metriques`

Colonnes `ctr_pct`, `cpc`, `roas` sont calculées en base (GENERATED ALWAYS AS STORED) —
jamais insérées/mises à jour côté service.

## Endpoints

| Méthode | Chemin | Description |
|---|---|---|
| `GET`  | `/` | Liste (filtres: id_campagne, id_creative, date_from, date_to) |
| `POST` | `/` | Upsert d'une ligne (clé unique : id_campagne + id_creative + date_jour) |
| `POST` | `/ingest` | Batch `{entries: [...]}` |
| `GET`  | `/aggregat/par-campagne` | Agrégats + ROAS/CTR/CPC recalculés sur période |
| `GET`  | `/campagne/:id/summary` | Résumé unique d'une campagne |
