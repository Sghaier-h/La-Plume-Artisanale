export default {
  name: 'fabrication/planning-gantt',
  version: '2.0.0',
  domain: 'D — Fabrication / Planning Gantt + drag & drop',
  domainRef: 'docs/domain.md §7.8',
  routePrefix: '/api/v2/fabrication/planning-gantt',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['fabrication/machines'],
};
