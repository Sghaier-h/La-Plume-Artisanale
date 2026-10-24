export default {
  name: 'fabrication-finition',
  version: '2.0.0',
  description: 'Finition : ourlet, frange, lavage, repassage — pointage postes finition (§7.4)',
  category: 'fabrication',
  depends: ['fabrication-ordres', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/finition' },
  active: true
};
