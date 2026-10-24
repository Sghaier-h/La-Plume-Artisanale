# crm-comptes-v2 (§3)

Comptes unifiés (lead / prospect / client / archive) + contacts + adresses + historique.

## Endpoints principaux

- `GET/POST/PUT/DELETE /api/v2/crm/comptes` (+ `/:id`)
- `GET/POST/PUT/DELETE /api/v2/crm/comptes/:id/contacts` (+ `/:idc`)
- `GET/POST/PUT/DELETE /api/v2/crm/comptes/:id/adresses` (+ `/:ida`)
- `GET/POST         /api/v2/crm/comptes/:id/historique`

## ABAC

- Un `COMMERCIAL` ne voit et ne modifie que ses comptes (filtre backend).
- Un `ADMIN` ou `DIRECTION` voit tout.
- La création par un COMMERCIAL positionne `id_commercial = user`.
- `code_client` généré via `NumeroSequenceService` (code `CLI`).
