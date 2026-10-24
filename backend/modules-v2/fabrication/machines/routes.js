// routes.js — fabrication/machines
//
// Consolidation Phase E4 : le module legacy `backend/modules/machines/` a été
// supprimé. Ses handlers (CRUD + stats + statut + maintenance + planning +
// historique arrêts) ont été portés tels quels ici dans `./legacy-controller.js`
// + `./legacy-routes.js`.
//
// Endpoints exposés sous `/api/v2/fabrication/machines` :
//   GET    /types
//   GET    /stats/global
//   GET    /numero/:numero
//   GET    /
//   POST   /
//   GET    /:id
//   PUT    /:id · PUT /:id/statut · PUT /:id/maintenance
//   DELETE /:id
//   GET    /:id/historique-arrets
//   GET    /:id/planning
export { default } from './legacy-routes.js';
