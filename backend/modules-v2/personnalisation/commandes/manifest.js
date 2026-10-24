export default {
  name: 'personnalisation/commandes',
  version: '2.0.0',
  domain: 'B — Produits / Personnalisation',
  domainRef: 'docs/domain.md §5.8.3–§5.8.4',
  routePrefix: '/api/v2/personnalisation/commandes',
  routes: () => import('./routes.js').then((m) => m.default),
  requires: ['personnalisation/config', 'ventes/devis', 'ventes/commandes'],
};
