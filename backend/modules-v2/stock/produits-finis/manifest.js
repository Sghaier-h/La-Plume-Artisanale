export default {
  name: 'stock/produits-finis',
  version: '2.0.0',
  domain: 'B — Stock',
  domainRef: 'docs/domain.md §6',
  routePrefix: '/api/v2/stock/produits-finis',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['produits/articles'],
};
