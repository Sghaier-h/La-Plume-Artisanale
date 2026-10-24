export default {
  name: 'produits/articles-generes',
  version: '2.0.0',
  domain: 'A — Produits / Articles générés (vue filtrée du catalogue)',
  domainRef: 'docs/domain.md §3.6',
  routePrefix: '/api/v2/produits/articles-generes',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['produits/catalogue'],
};
