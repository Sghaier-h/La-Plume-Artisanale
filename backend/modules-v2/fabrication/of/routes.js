// routes.js — fabrication/of
//
// Consolidation Phase E4 : le module legacy `backend/modules/of/` a été
// supprimé. Ses handlers (CRUD OF, détail complet, alimentation stock, actions
// démarrer/terminer/assigner-machine) ont été portés tels quels ici dans
// `./legacy-controller.js` + `./legacy-alimentation-controller.js` +
// `./legacy-routes.js`.
//
// Les actions `demarrer`/`terminer` s'appuient toujours sur les handlers du
// module legacy `backend/modules/production/` (non supprimé en Phase E4 : à
// porter avec un futur sous-module v2 `fabrication/production`).
//
// Endpoints sous `/api/v2/fabrication/of` :
//   GET    /alimentation/analyse
//   POST   /alimentation/article/:id · POST /alimentation/lot
//   POST   /:id/demarrer · /:id/terminer · /:id/assigner-machine
//   GET    /:id/detail-complet
//   GET    /       · POST   /
//   GET    /:id    · PUT    /:id    · DELETE /:id
export { default } from './legacy-routes.js';
