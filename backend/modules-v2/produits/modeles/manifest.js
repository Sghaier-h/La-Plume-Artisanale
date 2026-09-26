export default {
  name: 'produits/modeles',
  version: '2.0.0',
  domain: 'B — Produits',
  domainRef: 'docs/domain.md §5.1',
  routePrefix: '/api/v2/produits/modeles',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['produits/familles'],
};
