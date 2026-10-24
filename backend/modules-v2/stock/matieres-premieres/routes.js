// routes.js — stock/matieres-premieres
//
// Consolidation Phase E4 : le module legacy `backend/modules/matieres-premieres/`
// a été supprimé. Ses handlers (CRUD + stats + alertes + lookup par code + soft
// delete + restaurer + types) ont été portés tels quels ici dans
// `./legacy-controller.js` + `./legacy-routes.js`.
//
// Endpoints exposés sous `/api/v2/stock/matieres-premieres` :
//   GET    /types
//   GET    /stats/global
//   GET    /alertes/stock
//   GET    /code/:code
//   GET    /
//   POST   /
//   GET    /:id
//   PUT    /:id
//   PUT    /:id/restaurer
//   DELETE /:id
//
// Les anciens scaffolds v2 (./model.js, ./controller.js, ./service.js) ne sont
// plus montés mais conservés pour référence (schema CRUD factory).
export { default } from './legacy-routes.js';
