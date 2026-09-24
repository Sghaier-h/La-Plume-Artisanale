# personnalisation/commandes — v2

CRUD sur `commandes_personnalisations` (§5.8.3 domain.md) : une ligne = une
personnalisation appliquée à une ligne de devis ou de commande.

Types supportés (colonne `type_personnalisation`) :
`broderie`, `serigraphie`, `rayures_personnalisees`, `couleurs_personnalisees`,
`dimensions_custom`, `pack_compose`.

Endpoints (`/api/v2/personnalisation/commandes`) :
- `GET /` — liste paginée
- `GET /:id` — fiche
- `POST /` — création avec `parametres_json` (structure §5.8.3) (auth)
- `PUT /:id` — mise à jour (auth)
- `DELETE /:id` — soft-delete (auth)
- `POST /:id/valider-client` — met `validee_par_client = true`, `date_validation_client = NOW()` (auth)
- `POST /:id/valider-commercial` — idem côté commercial : renseigne
  `id_commercial` depuis `req.user`, injecte `specs_atelier_json` fournis
  ou générés depuis `parametres_json` via `genererSpecsAtelier()` (auth)
