export default {
  name: 'bom/master',
  version: '2.0.0',
  domain: 'B — BOM',
  domainRef: 'docs/domain.md §7.2',
  routePrefix: '/api/v2/bom/master',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['produits/articles'],
};
