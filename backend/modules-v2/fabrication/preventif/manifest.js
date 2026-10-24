export default {
  name: 'fabrication-preventif',
  version: '1.0.0',
  description: 'Maintenances préventives planifiées (gammes/plans). T3c.',
  category: 'fabrication',
  depends: [],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/preventif' },
  active: true,
};
