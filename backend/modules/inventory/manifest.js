/**
 * Inventory Module - Inventaire Avancé
 * Module pour gérer les inventaires, ajustements, valuations
 */

export default {
  name: 'inventory',
  version: '1.0.0',
  category: 'Inventory',
  depends: ['base', 'stock', 'product'],
  summary: 'Inventaire Avancé',
  description: 'Module complet de gestion d\'inventaire avancé',
  data: [
    'security/ir.model.access.json',
  ],
  models: [
    'models/Inventory.js',
    'models/InventoryAdjustment.js',
    'models/InventoryValuation.js'
  ],
  controllers: [
    'controllers/inventory.controller.js',
    'controllers/inventory_adjustment.controller.js'
  ],
  routes: [
    'routes/inventory.routes.js',
    'routes/inventory_adjustment.routes.js'
  ]
};
