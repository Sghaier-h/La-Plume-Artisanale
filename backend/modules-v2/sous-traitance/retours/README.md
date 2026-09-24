# sous-traitance/retours

Réf. §7.11. Réception, contrôle, pertes et litiges. Historique de mouvements complet dans `mouvements_st`.

## Endpoints (`/api/v2/sous-traitance/retours`)

- `POST /:id/receptionner` — enregistre `quantite_retournee` / `quantite_perdue`, met à jour `statut` :
  - reste = 0 → `retour_complet`
  - reste > 0 & rendu > 0 → `en_retour_partiel`
- `POST /:id/litige` — bascule `statut=litige`
- `GET /:id/historique` — mouvements chronologiques
