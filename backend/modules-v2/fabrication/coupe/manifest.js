export default {
  name: 'fabrication-coupe',
  version: '2.0.0',
  description: 'Coupe : sessions + journal pièces (1er/2e/déchet/ourlet) + décompte stock PF (§7.19)',
  category: 'fabrication',
  depends: ['fabrication-ordres', 'stock', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/coupe' },
  active: true
};
