export default {
  name: 'export',
  version: '1.0.0',
  description: 'Export générique XLSX par entité (factures/commandes/clients/employes). T3c.',
  category: 'export',
  depends: [],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/export' },
  active: true,
};
