export default {
  name: 'produits/familles',
  version: '2.0.0',
  domain: 'B — Produits',
  domainRef: 'docs/domain.md §5',
  routePrefix: '/api/v2/produits/familles',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: [],
};
