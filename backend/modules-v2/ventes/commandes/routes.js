// routes.js — ventes/commandes
//
// Consolidation: le module legacy `backend/modules/commandes/` a été supprimé.
// Ses handlers (CRUD, valider, preview-ofs, generer-ofs, analyse-stock,
// executer-choix, with-ofs) ont été portés tels quels ici dans
// `./legacy-controller.js` + `./legacy-routes.js`.
//
// Les anciens scaffolds v2 (./controller.js, ./service.js, ./model.js) ne sont
// plus montés mais conservés comme référence pour un futur refactor.
export { default } from './legacy-routes.js';
