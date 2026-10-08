export default {
  name: 'fabrication-ourdissage',
  version: '2.0.0',
  description: 'Ourdissage : ensouples + calcul poids fil chaîne (§7.17)',
  category: 'fabrication',
  depends: ['fabrication-ordres', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/ourdissage' },
  active: true
};
