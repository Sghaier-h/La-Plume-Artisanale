export default {
  name: 'produits/catalogue',
  version: '2.0.0',
  domain: 'A — Produits / Catalogue articles',
  domainRef: 'docs/domain.md §3',
  routePrefix: '/api/v2/produits/catalogue',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['produits/articles'],
};
