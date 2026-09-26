# produits/familles — v2

CRUD des familles / catégories d'articles (§5 domain.md).

Table : `familles_articles`.

Endpoints :
- `GET    /api/v2/produits/familles?page=&limit=&q=`
- `GET    /api/v2/produits/familles/:id`
- `POST   /api/v2/produits/familles`
- `PUT    /api/v2/produits/familles/:id`
- `DELETE /api/v2/produits/familles/:id` (soft delete — `actif=false`)

Enveloppe : `{ success, data, error }`.
