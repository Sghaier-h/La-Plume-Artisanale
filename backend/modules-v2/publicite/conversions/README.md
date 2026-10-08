# publicite/conversions — Tracking conversions

**Table** : `conversions_pub`
**Contrat** : `docs/domain.md §11quinquies.9`
**Route** : `/api/v2/publicite/conversions`

## Endpoints

| Méthode | Chemin | Description |
|---|---|---|
| `POST` | `/track`       | **Public** — endpoint appelé par pixel/JS front. Fusionne body + cookies + query |
| `GET`  | `/summary/utm` | Agrégats par utm_source/medium/campaign (filtres date_from/date_to) |
| `GET`  | `/`            | Liste brute (multi-filtres) |

Le controller lit les cookies (fbclid, gclid, ttclid, utm_*) via un parseur minimal
(pas de dépendance à `cookie-parser`), capture le `user-agent` et l'IP source, et
insère la ligne. Types acceptés : `page_view|add_to_cart|initiate_checkout|purchase|signup|lead|contact|custom`.
