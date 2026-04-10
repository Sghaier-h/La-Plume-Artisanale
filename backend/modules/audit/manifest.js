/**
 * Module Audit - Tools
 */

export default {
  name: 'audit',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion audit',
  description: 'Module de gestion audit',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Audit.js'
  ],
  controllers: [
    'controllers/audit.controller.js'
  ],
  routes: [
    'routes/audit.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
