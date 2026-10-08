export default {
  name: 'stock/pieces-rechange',
  version: '2.0.0',
  domain: 'B — Stock',
  domainRef: 'docs/domain.md §6.1',
  routePrefix: '/api/v2/stock/pieces-rechange',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: [],
};
