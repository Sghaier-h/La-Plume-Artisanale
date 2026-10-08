/**
 * Inventaires (alias) — re-monte inventory_adjustment à /api/inventaires
 * pour la compatibilité FE historique.
 */
export default {
  name: 'inventaires',
  version: '1.0.0',
  category: 'Inventory',
  depends: ['inventory'],
  summary: 'Alias Inventaires -> inventory/adjustments',
  description: 'Rétro-compatibilité pour le FE ancien qui appelle /api/inventaires',
  routes: [
    'routes/inventaires.routes.js'
  ]
};
