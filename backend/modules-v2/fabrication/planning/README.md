# fabrication/planning — Planning Gantt

Réf. §7.12. Vue Gantt machines × créneaux, drag-drop pour assignation/replanification.

## Endpoints (`/api/v2/fabrication/planning`)

- `GET /gantt?date_debut=&date_fin=&id_machine=` — vue Gantt
- `POST /:id/assigner` — assigner OF à une machine + slot
- `PUT /:id/replanifier` — drag-drop repositionnement

## Contraintes (§7.12)

- laize machine ≥ laize article
- nb couleurs ≤ nb sélecteurs machine
- MP disponible aux dates
- machine non en panne
