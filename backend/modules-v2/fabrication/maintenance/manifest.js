export default {
  name: 'fabrication/maintenance',
  version: '2.0.0',
  domain: 'D — Fabrication / Maintenance machines',
  domainRef: 'docs/domain.md §7.10',
  routePrefix: '/api/v2/fabrication/maintenance',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['fabrication/machines'],
};
