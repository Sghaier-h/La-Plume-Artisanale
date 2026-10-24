# stock/inventaires — v2

CRUD inventaires + lignes (§6.8 domain.md). Modes : `ajustement_delta` (défaut), `reset_absolu`.

Endpoints supplémentaires :
- `GET  /api/v2/stock/inventaires/:id/lignes`
- `POST /api/v2/stock/inventaires/:id/lignes`

Numéro auto `INV-YYYYMMDD-NNNNN`.
