export default {
  name: 'qualite-rapports',
  version: '2.0.0',
  description: 'Rapports qualité : taux 2e choix par machine (7 j glissants), taux défauts par type',
  category: 'qualite',
  depends: ['qualite-controles', 'qualite-defauts', 'fabrication-ordres', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/qualite/rapports' },
  active: true
};
