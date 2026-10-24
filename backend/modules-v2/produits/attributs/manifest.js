export default {
  name: 'produits/attributs',
  version: '2.0.0',
  domain: 'A — Produits / Paramètres catalogue (dimensions, couleurs, finitions...)',
  domainRef: 'docs/domain.md §3.5',
  routePrefix: '/api/v2/produits/attributs',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: [],
};
