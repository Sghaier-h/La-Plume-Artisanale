export default {
  name: 'qualite/avance',
  version: '2.0.0',
  domain: 'E — Qualité / Contrôles avancés (fusion qualite-avance + qualite-avancee + quality)',
  domainRef: 'docs/domain.md §8.5',
  routePrefix: '/api/v2/qualite/avance',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: [],
};
