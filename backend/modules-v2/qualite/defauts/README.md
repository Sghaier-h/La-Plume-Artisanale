# qualite/defauts — Nomenclature & signalements

## Endpoints (`/api/v2/qualite/defauts`)

- `GET /types` — nomenclature (seed `10_defauts_types.sql`)
- `GET|POST /signales` — signalements
- `POST /signales/:id/resoudre`
- `GET|POST /signales/:id/photos` — upload photos (multipart ou url directe)

Le POST photo attache un enregistrement `photos_defauts`. L'implémentation du stockage physique (multer, S3…) est déléguée au middleware upload de la couche `base`.
