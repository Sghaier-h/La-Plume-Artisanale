# sous-traitance/envois

Réf. §7.10, §7.11. Bons sortie ST persistants (numéro `BSST-YYYY-NNNNN`, `date_retour_prevue` obligatoire).

## Endpoints (`/api/v2/sous-traitance/envois`)

- `GET /sous-traitants` — liste sous-traitants actifs
- `GET /` — liste bons (filtres `id_soustraitant`, `id_of`, `statut`)
- `GET /:id`
- `POST /` — créer bon (numéro auto)
- `POST /:id/expedier` — signature + photos + mouvement `envoi`
- `PUT /:id`
