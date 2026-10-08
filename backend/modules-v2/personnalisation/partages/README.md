# personnalisation/partages — v2

Gère la table `personnalisations_partages` (§5.8.8 domain.md) : bouton
"Partager mon design" du configurateur B2C (WhatsApp / Instagram / etc.).

Fonctionnement :
- `POST /` génère un `code_court` de 8 caractères (alphabet sans O/0/1/I/l),
  snapshot `parametres_snapshot` (ou `parametres_json`) et enregistre l'IP.
  Retry auto sur collision d'unicité (jusqu'à 8 tentatives).
- `GET /:code_court` retourne le partage et incrémente `nb_vues` en une
  seule requête `UPDATE ... RETURNING *`. Renvoie 410 si expiré.
- `POST /:code_court/conversion` (auth) incrémente `nb_conversions_panier`
  quand le lien génère une commande.

Endpoints (`/api/v2/personnalisation/partages`) :
- `POST /` — création (public, un visiteur peut partager sans compte)
- `GET /:code_court` — lecture publique + increment `nb_vues`
- `POST /:code_court/conversion` — tracking business (auth)
