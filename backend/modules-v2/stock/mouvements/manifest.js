export default {
  name: 'stock/mouvements',
  version: '2.0.0',
  domain: 'B — Stock',
  domainRef: 'docs/domain.md §6.5',
  routePrefix: '/api/v2/stock/mouvements',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['stock/entrepots','produits/articles'],
};
