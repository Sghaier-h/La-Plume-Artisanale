// routes.js — ventes/avoirs
//
// Consolidation: le module legacy `backend/modules/avoirs/` a été supprimé.
// Ses handlers (CRUD, from-facture, valider/appliquer/annuler, PDF,
// stats/global) ont été portés tels quels ici dans `./legacy-controller.js`
// + `./legacy-routes.js`.
//
// Les anciens scaffolds v2 (./controller.js, ./service.js, ./model.js) ne sont
// plus montés mais conservés comme référence pour un futur refactor.
export { default } from './legacy-routes.js';
