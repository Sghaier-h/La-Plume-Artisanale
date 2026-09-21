/**
 * Module Migration - Tools
 */

export default {
  name: 'migration',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion migration',
  description: 'Module de gestion migration',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Migration.js'
  ],
  controllers: [
    'controllers/migration.controller.js'
  ],
  routes: [
    'routes/migration.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
