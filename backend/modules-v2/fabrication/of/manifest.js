export default {
  name: 'fabrication/of',
  version: '2.0.0',
  domain: 'D — Fabrication / Ordres de fabrication',
  domainRef: 'docs/domain.md §7.5',
  routePrefix: '/api/v2/fabrication/of',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['fabrication/machines'],
};
