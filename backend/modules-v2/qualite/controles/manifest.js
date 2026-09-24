export default {
  name: 'qualite-controles',
  version: '2.0.0',
  description: 'Contrôles qualité OF (visuel, dimensionnel, colorimétrique, retour ST) — §7.9',
  category: 'qualite',
  depends: ['fabrication-ordres', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/qualite/controles' },
  active: true
};
