# qualite/controles — Contrôles qualité

Réf. §7.9. Types : `visuel`, `dimensionnel`, `colorimetrique`, `resistance`, `poids`, `retour_soustraitance`.

## Endpoints (`/api/v2/qualite/controles`)

- `GET|POST /` — liste / création (auto-blocage OF si `est_bloquant=true`)
- `GET /:id`
- `POST /:id/decider` — `laisser_passer_1c` | `passer_2c` | `rework` | `rebut` ; débloque OF si accepté
