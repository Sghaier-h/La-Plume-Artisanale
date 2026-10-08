export default {
  name: 'personnalisation/config',
  version: '2.0.0',
  domain: 'B — Produits / Personnalisation',
  domainRef: 'docs/domain.md §5.8.2',
  routePrefix: '/api/v2/personnalisation/config',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['produits/articles', 'produits/modeles'],
};
