# stock/mouvements — v2

Service **central** de mouvements de stock (§6.5 domain.md).

Types supportés (11) :
`reception_fournisseur`, `entree_fabrication`, `sortie_vente`, `sortie_of`,
`transfert_entrepot`, `reservation`, `liberation_reservation`,
`ajustement_positif`, `ajustement_negatif`, `retour_client`, `mise_au_rebut`.

**Atomicité** :
- Toute création passe par `withTransaction()` — rollback en cas d'échec.
- `transfert_entrepot` = **2 mouvements liés** (sortie source + entrée destination) insérés dans la **même** transaction. Le rollback annule les deux.
- Validation métier : source/destination cohérents, quantité > 0 (sauf mouvements logiques `reservation` / `liberation_reservation`).

Endpoints :
- `GET  /api/v2/stock/mouvements?id_article=&id_entrepot_source=&id_entrepot_destination=&type_mouvement=&statut=&date_min=&date_max=&page=&limit=`
- `GET  /api/v2/stock/mouvements/:id`
- `POST /api/v2/stock/mouvements`
- `POST /api/v2/stock/mouvements/:id/annuler`
- `POST /api/v2/stock/mouvements/:id/valider`

Réponses erreurs métier : `error.code = 'VALIDATION'`.

Table `mouvements_stock` immuable (INSERT only ; seul `statut` mutable).
