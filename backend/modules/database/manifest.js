/**
 * Module Database - Tools
 */

export default {
  name: 'database',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion database',
  description: 'Module de gestion database',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Database.js'
  ],
  controllers: [
    'controllers/database.controller.js'
  ],
  routes: [
    'routes/database.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
