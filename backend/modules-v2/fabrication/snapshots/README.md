# fabrication/snapshots — Service background snapshots temps réel

Réf. §7.18. Régénère `snapshots_ofs_tissage` (37 colonnes dénormalisées) toutes les 5 minutes pour alimenter les dashboards ateliers.

## Boucle

- `demarrerService()` — `setInterval(5 min)` + purge > 24 h
- Idempotent : deuxième appel = no-op
- À monter depuis `server.js` (bootstrap) :
  ```js
  import { demarrerService } from './modules-v2/fabrication/snapshots/service.js';
  demarrerService();
  ```

## Endpoints (`/api/v2/fabrication/snapshots`)

- `POST /rafraichir` — trigger manuel
- `GET /machines/:id_machine` — dernier snapshot par OF pour une machine
- `POST /service/demarrer` / `POST /service/arreter`

## Formules alimentées

- `duites_restantes = nb_duites × (qte_restante / qte_prevue)`
- `temps_restant_min = duites_restantes / vitesse_max_duite_min`
- `alerte_500m = metres_restants < 500`
