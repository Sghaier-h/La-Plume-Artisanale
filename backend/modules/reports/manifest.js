/**
 * Module Reports - Tools
 */

export default {
  name: 'reports',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion reports',
  description: 'Module de gestion reports',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Reports.js'
  ],
  controllers: [
    'controllers/reports.controller.js'
  ],
  routes: [
    'routes/reports.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
