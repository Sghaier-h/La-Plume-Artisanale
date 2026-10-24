// routes.js — ventes/bl (bons de livraison)
//
// Consolidation: le module legacy `backend/modules/bons-livraison/` a été
// supprimé. Ses handlers (CRUD, from-commande, valider/livrer/annuler, PDF,
// stats/global) ont été portés tels quels ici dans `./legacy-controller.js`
// + `./legacy-routes.js`.
//
// Les anciens scaffolds v2 (./controller.js, ./service.js, ./model.js) ne sont
// plus montés mais conservés comme référence pour un futur refactor.
export { default } from './legacy-routes.js';
