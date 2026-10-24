export default {
  name: 'stock/entrepots',
  version: '2.0.0',
  domain: 'B — Stock',
  domainRef: 'docs/domain.md §6.2',
  routePrefix: '/api/v2/stock/entrepots',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: [],
};
