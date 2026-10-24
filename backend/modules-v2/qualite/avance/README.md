# qualite/avance — v2 (fusion)

Phase G3 — fusion de 3 modules legacy :

| Legacy module                     | Rôle                                        |
| :-------------------------------- | :------------------------------------------ |
| `backend/modules/qualite-avance/` | Contrôles + non-conformités + déclarations  |
| `backend/modules/qualite-avancee/`| Variante orthographique + endpoints FE      |
| `backend/modules/quality/`        | Checks / Points / Alerts (modèle Odoo)      |

Handlers portés verbatim :
- `./legacy-qa-controller.js` + `./legacy-qa-routes.js`
- `./legacy-qae-controller.js` + `./legacy-qae-routes.js` (délègue à qa)
- `./legacy-check-controller.js` + `./legacy-check-routes.js`
- `./legacy-point-controller.js` + `./legacy-point-routes.js`
- `./legacy-alert-controller.js` + `./legacy-alert-routes.js`

Routes consolidées sous `/api/v2/qualite/avance` :
- `/`         → tout le CRUD qualité avancée moderne (controles, non-conformites, declarations, controle-premiere-piece, actions-correctives, stats/global, rétro-compat CRUD racine)
- `/checks`   → quality_check (modèle Odoo)
- `/points`   → quality_point
- `/alerts`   → quality_alert

Modules legacy supprimés en Phase G3.
