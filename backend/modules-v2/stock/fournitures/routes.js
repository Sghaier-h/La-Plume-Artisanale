// routes.js — stock/fournitures
//
// Consolidation Phase E4 : alias du module legacy `backend/modules/fournitures/`
// qui filtre `articles_catalogue` par type 'fourniture'. Routes portées verbatim
// dans `./legacy-routes.js`. Les handlers restent dans
// `backend/modules/articles-catalogue/` (non supprimé en Phase E4 — à traiter
// avec un futur sous-module v2 `produits/catalogue`).
export { default } from './legacy-routes.js';
