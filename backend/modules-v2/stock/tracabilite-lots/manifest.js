export default {
  name: 'stock/tracabilite-lots',
  version: '2.0.0',
  domain: 'B — Stock / Traçabilité',
  domainRef: 'docs/domain.md §6.5',
  routePrefix: '/api/v2/stock/tracabilite-lots',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['stock/matieres-premieres'],
};
