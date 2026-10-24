# fabrication/planning-gantt — v2 (fusion)

Phase G3 — fusion de 2 modules legacy :

| Legacy module                                | Rôle                                        |
| :------------------------------------------- | :------------------------------------------ |
| `backend/modules/planification-gantt/`       | Vue Gantt (projets, tâches, ressources)     |
| `backend/modules/planning-dragdrop/`         | Planning OF drag & drop (par machine)       |

Handlers portés verbatim :
- `./legacy-gantt-controller.js` + `./legacy-gantt-routes.js`
- `./legacy-dragdrop-controller.js` + `./legacy-dragdrop-routes.js`

Routes fusionnées sous `/api/v2/fabrication/planning-gantt` dans `routes.js`.

Les anciens chemins Gantt (`/projets`, `/taches`, `/ressources`, `/gantt-data`)
sont conservés en racine pour compat legacy, et dupliqués sous `/gantt/*`
pour une organisation future plus claire.

Modules legacy supprimés en Phase G3.
