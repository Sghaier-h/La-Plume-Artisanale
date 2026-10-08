# personnalisation/referentiels — v2

Lecture des 3 référentiels utilisés par le configurateur produit
(§5.8 / §5.8.8 domain.md) :

- `personnalisation_zones` — 5 emplacements standard + extensions expertes
- `personnalisation_polices` — polices broderie
- `personnalisation_fils_couleurs` — bobines Madeira/Isacord/Amann/Coats

Endpoints (`/api/v2/personnalisation/referentiels`) :
- `GET /zones` — zones actives (`?actif_only=false` pour tout voir)
- `GET /polices` — polices actives
- `GET /fils-couleurs` — fils actifs (`?marque=Madeira` pour filtrer)

Toutes les routes sont publiques (utilisées par le configurateur B2C sans auth).
