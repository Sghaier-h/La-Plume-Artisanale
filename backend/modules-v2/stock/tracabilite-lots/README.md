# stock/tracabilite-lots — v2

Traçabilité lots de coupe (QR, étiquettes, chaîne) — handlers legacy portés
verbatim (Phase E4).

Endpoints sous `/api/v2/stock/tracabilite-lots` :
- `GET  /stats/global`
- `GET  /qr/:qr_code`
- `GET  /of/:id_of`
- `GET  /coupe` · `POST /coupe` · `GET/PUT/DELETE /coupe/:id`
- `PUT  /coupe/:id/statut`
- `GET  /:id/qr-code` · `POST /:id/imprimer-etiquette`
- `GET  /:id_lot/chaine`
- `GET  /`
