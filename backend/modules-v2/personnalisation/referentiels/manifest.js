export default {
  name: 'personnalisation/referentiels',
  version: '2.0.0',
  domain: 'B — Produits / Personnalisation',
  domainRef: 'docs/domain.md §5.8 (référentiels configurateur)',
  routePrefix: '/api/v2/personnalisation/referentiels',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: [],
};
