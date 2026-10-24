export default {
  name: 'qualite-defauts',
  version: '2.0.0',
  description: 'Nomenclature défauts + signalements avec upload photos',
  category: 'qualite',
  depends: ['qualite-controles', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/qualite/defauts' },
  active: true
};
