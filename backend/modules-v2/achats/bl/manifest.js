export default {
  name: 'achats-bl',
  version: '1.0.0',
  description: 'Bons de livraison fournisseurs (BL entrants). T3c.',
  category: 'achats',
  depends: [],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/achats/bl' },
  active: true,
};
