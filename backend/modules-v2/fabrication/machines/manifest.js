export default {
  name: 'fabrication/machines',
  version: '2.0.0',
  domain: 'D — Fabrication / Machines',
  domainRef: 'docs/domain.md §7.3',
  routePrefix: '/api/v2/fabrication/machines',
  routes: () => import('./routes.js').then((m) => m.default),
};
