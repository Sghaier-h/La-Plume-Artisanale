export default {
  name: 'sous-traitance-retours',
  version: '2.0.0',
  description: 'Retours sous-traitance : réception, contrôle qualité, pertes, litiges (§7.11)',
  category: 'sous-traitance',
  depends: ['sous-traitance-envois', 'qualite-controles', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/sous-traitance/retours' },
  active: true
};
