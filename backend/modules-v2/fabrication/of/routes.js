// routes.js — fabrication/of
//
// Consolidation Phase E4 : le module legacy `backend/modules/of/` a été
// supprimé. Ses handlers (CRUD OF, détail complet, alimentation stock, actions
// démarrer/terminer/assigner-machine) ont été portés tels quels ici dans
// `./legacy-controller.js` + `./legacy-alimentation-controller.js` +
// `./legacy-routes.js`.
//
// Phase G3 : les actions `demarrer`/`terminer` s'appuient désormais sur
// `./legacy-production-controller.js` (copie verbatim du contrôleur legacy
// `backend/modules/production/` — supprimé en Phase G3).
//
// Endpoints sous `/api/v2/fabrication/of` :
//   GET    /alimentation/analyse
//   POST   /alimentation/article/:id · POST /alimentation/lot
//   POST   /:id/demarrer · /:id/terminer · /:id/assigner-machine
//   GET    /:id/detail-complet
//   GET    /       · POST   /
//   GET    /:id    · PUT    /:id    · DELETE /:id
export { default } from './legacy-routes.js';
