/**
 * Module Tracabilite-lots - Inventory
 */

export default {
  name: 'tracabilite-lots',
  version: '1.0.0',
  category: 'Inventory',
  summary: 'Gestion tracabilite-lots',
  description: 'Module de gestion tracabilite-lots',
  depends: ["base","stock"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Tracabilite-lots.js'
  ],
  controllers: [
    'controllers/tracabilite-lots.controller.js'
  ],
  routes: [
    'routes/tracabilite-lots.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
