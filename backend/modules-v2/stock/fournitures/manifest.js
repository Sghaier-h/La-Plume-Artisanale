export default {
  name: 'stock/fournitures',
  version: '2.0.0',
  domain: 'B — Stock / Fournitures',
  domainRef: 'docs/domain.md §6.4',
  routePrefix: '/api/v2/stock/fournitures',
  routes: () => import('./routes.js').then((m) => m.default),
};
