/**
 * Module Stock-multi-entrepots - Inventory
 */

export default {
  name: 'stock-multi-entrepots',
  version: '1.0.0',
  category: 'Inventory',
  summary: 'Gestion stock-multi-entrepots',
  description: 'Module de gestion stock-multi-entrepots',
  depends: ["base","stock"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Stock-multi-entrepots.js'
  ],
  controllers: [
    'controllers/stock-multi-entrepots.controller.js'
  ],
  routes: [
    'routes/stock-multi-entrepots.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
