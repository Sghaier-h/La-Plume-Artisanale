export default {
  name: 'personnalisation/partages',
  version: '2.0.0',
  domain: 'B — Produits / Personnalisation',
  domainRef: 'docs/domain.md §5.8.8',
  routePrefix: '/api/v2/personnalisation/partages',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['personnalisation/config'],
};
