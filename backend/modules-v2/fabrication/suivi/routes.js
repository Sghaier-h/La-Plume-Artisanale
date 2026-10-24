// routes.js — fabrication/suivi
//
// Consolidation Phase E4 : le module legacy `backend/modules/suivi-fabrication/`
// a été supprimé. Ses handlers (CRUD suivi + summary OF + stats machine +
// day operateur) ont été portés tels quels ici dans `./legacy-controller.js`
// + `./legacy-routes.js`.
//
// Endpoints sous `/api/v2/fabrication/suivi` :
//   GET /of/:id_of/summary · /of/:id_of/avancement
//   GET /machine/:id_machine/stats
//   GET /operateur/:id_operateur/day
//   CRUD standard
export { default } from './legacy-routes.js';
