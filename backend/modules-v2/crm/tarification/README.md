# crm-tarification-v2 (§4)

Grilles tarifaires (`remise_globale_pct` / `prix_par_article` / `palier_quantite`), lignes par article, remises client, simulateur de prix.

## Endpoints
- `GET/POST/PUT/DELETE /api/v2/crm/tarifs`      (+ `/:id`)
- `POST/PUT/DELETE     /api/v2/crm/tarifs/:id/lignes` (+ `/:idl`)
- `GET/POST/PUT/DELETE /api/v2/crm/remises`     (+ `/:id`)
- `POST                /api/v2/crm/compute`     — calcul prix conforme §4.3

Ordre d'application (§4.3) : ligne spécifique (article + palier) > remise globale de la grille > taux TVA défaut de la grille.
