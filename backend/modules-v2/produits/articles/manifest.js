export default {
  name: 'produits/articles',
  version: '2.0.0',
  domain: 'B — Produits',
  domainRef: 'docs/domain.md §5.5',
  routePrefix: '/api/v2/produits/articles',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['produits/modeles','produits/familles'],
};
