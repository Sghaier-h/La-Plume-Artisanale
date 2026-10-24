export default {
  name: 'fabrication/suivi',
  version: '2.0.0',
  domain: 'D — Fabrication / Suivi',
  domainRef: 'docs/domain.md §7.6',
  routePrefix: '/api/v2/fabrication/suivi',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['fabrication/of', 'fabrication/machines'],
};
