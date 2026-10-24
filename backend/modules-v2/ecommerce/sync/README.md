# ecommerce/sync — Synchronisation catalogue

**Tables** : `ecommerce_sync_log` (lecture), `articles_catalogue`, `stock_articles` (source)
**Contrat** : `docs/domain.md §11quinquies.3`
**Route** : `/api/v2/ecommerce/sync`

## Endpoints

| Méthode | Chemin | Body | Description |
|---|---|---|---|
| `GET`  | `/logs` | — | Historique (filtres : id_site, type_sync, statut) |
| `GET`  | `/logs/:id` | — | Détail d'un log |
| `POST` | `/article` | `{id_site, id_article}` | Push article (create/update) |
| `POST` | `/stock`   | `{id_site, id_article}` | MAJ stock uniquement |
| `POST` | `/prix`    | `{id_site, id_article}` | MAJ prix uniquement |
| `POST` | `/batch`   | `{id_site, id_articles:[]}` | Push d'un lot d'articles |

Le service prépare le payload par plateforme (Shopify / Woo) et journalise avec `statut='ignore'`
tant que l'adapteur HTTP externe n'est pas branché. Le hook `TODO` du service marque le point
d'intégration `fetch(...)`. La journalisation (durée ms, payload, erreur) est déjà fonctionnelle.
