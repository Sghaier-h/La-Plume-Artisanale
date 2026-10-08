# personnalisation/config — v2

Gestion de la table `personnalisations_config` (§5.8.2 domain.md).

Une ligne active la personnalisation pour un scope produit :
- `id_article` (variante précise) OU `id_modele` (toute la famille)
- `types_autorises` : broderie, sérigraphie, rayures, couleurs, dimensions, pack
- `moq_par_type_json`, `zones_impression_json`, `surfaces_max_cm2_json`
- `couleurs_disponibles_json`, `polices_disponibles_json`
- `supplements_prix_json`, `delai_supplementaire_jours`, `prix_degressifs_json`

Endpoints (`/api/v2/personnalisation/config`) :
- `GET /` — liste paginée, filtres via query
- `GET /:id` — fiche
- `POST /` — création (auth)
- `PUT /:id` — mise à jour (auth)
- `DELETE /:id` — soft-delete `actif = false` (auth)
