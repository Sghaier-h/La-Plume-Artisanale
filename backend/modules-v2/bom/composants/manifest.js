export default {
  name: 'bom/composants',
  version: '2.0.0',
  domain: 'B — BOM',
  domainRef: 'docs/domain.md §7.2, §7.17',
  routePrefix: '/api/v2/bom/composants',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['bom/master','produits/articles'],
};
