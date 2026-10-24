export default {
  name: 'fabrication/taches',
  version: '2.0.0',
  domain: 'D — Fabrication / Tâches opérateurs',
  domainRef: 'docs/domain.md §7.9',
  routePrefix: '/api/v2/fabrication/taches',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: [],
};
