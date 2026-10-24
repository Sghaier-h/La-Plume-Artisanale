// routes.js — ventes/devis
//
// Consolidation: le module legacy `backend/modules/devis/` a été supprimé.
// Ses handlers (CRUD complet avec lignes/totaux, PDF, transformer→commande)
// ont été portés tels quels ici dans `./legacy-controller.js` + `./legacy-routes.js`.
// Le routeur legacy expose:
//   GET    /:id/pdf                — PDF (via pdf.service.js, non modulaire)
//   GET    /                        — list avec filtres
//   GET    /:id                     — détail + lignes
//   POST   /                        — create (calcule totaux, insère lignes)
//   PUT    /:id                     — update (recalc si lignes fournies)
//   POST   /:id/transformer         — devis → commande
//   DELETE /:id                     — delete (refusé si TRANSFORME)
//
// Les anciens scaffolds v2 (./controller.js, ./service.js, ./model.js) ne sont
// plus montés mais conservés comme référence pour un futur refactor.
export { default } from './legacy-routes.js';
