# fabrication/tissage — Sessions temps réel

Réf. §7.18. Sessions opérateur × machine × OF avec pointages, incidents, compteur.

## Endpoints (`/api/v2/fabrication/tissage`)

- `GET /sessions` — filtres `id_of`, `id_machine`, `id_operateur`, `statut`
- `GET /sessions/:id`
- `POST /sessions` — démarrer session
- `POST /sessions/:id/pause` — pause
- `POST /sessions/:id/reprendre`
- `POST /sessions/:id/cloturer` — clôture + calcul `duites_total`
- `POST /sessions/:id/incident` — panne, casse fil, changement fil, ensouple…

Les snapshots temps réel sont produits par le module `fabrication/snapshots` (5 min).
