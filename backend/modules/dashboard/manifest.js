/**
 * Module Dashboard - Tools
 */

export default {
  name: 'dashboard',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion dashboard',
  description: 'Module de gestion dashboard',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Dashboard.js'
  ],
  controllers: [
    'controllers/dashboard.controller.js'
  ],
  routes: [
    'routes/dashboard.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
