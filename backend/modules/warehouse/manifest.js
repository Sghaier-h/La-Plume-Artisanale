/**
 * Module Warehouse - Inventory
 */

export default {
  name: 'warehouse',
  version: '1.0.0',
  category: 'Inventory',
  summary: 'Gestion warehouse',
  description: 'Module de gestion warehouse',
  depends: ["base","stock"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Warehouse.js'
  ],
  controllers: [
    'controllers/warehouse.controller.js'
  ],
  routes: [
    'routes/warehouse.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
