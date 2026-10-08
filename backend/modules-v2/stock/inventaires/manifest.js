export default {
  name: 'stock/inventaires',
  version: '2.0.0',
  domain: 'B — Stock',
  domainRef: 'docs/domain.md §6.8',
  routePrefix: '/api/v2/stock/inventaires',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['stock/entrepots','produits/articles'],
};
