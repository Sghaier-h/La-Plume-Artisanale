export default {
  name: 'fabrication/mrp',
  version: '2.0.0',
  domain: 'D — Fabrication / MRP (BOM, work centers, work orders, routings, productions)',
  domainRef: 'docs/domain.md §7.11',
  routePrefix: '/api/v2/fabrication/mrp',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['produits/catalogue'],
};
