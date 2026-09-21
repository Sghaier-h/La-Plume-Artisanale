/**
 * Entrepots (alias) — re-monte warehouse à /api/entrepots
 */
export default {
  name: 'entrepots',
  version: '1.0.0',
  category: 'Warehouse',
  depends: ['warehouse'],
  summary: 'Alias Entrepots -> warehouse',
  description: 'Rétro-compatibilité pour le FE ancien qui appelle /api/entrepots',
  routes: [
    'routes/entrepots.routes.js'
  ]
};
