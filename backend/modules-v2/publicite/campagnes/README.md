# publicite/campagnes — Campagnes & créatives

**Tables** : `campagnes_pub`, `creatives_pub`
**Contrat** : `docs/domain.md §11quinquies.9`
**Route** : `/api/v2/publicite/campagnes`

## Endpoints

CRUD campagnes + `POST /:id/statut` (`{statut}`) parmi
`brouillon|active|en_pause|terminee|archivee|en_revision`.

Créatives nested :
- `GET   /:id/creatives`
- `POST  /:id/creatives`
- `GET   /:id/creatives/:creative_id`
- `PUT   /:id/creatives/:creative_id`
- `DELETE /:id/creatives/:creative_id`
