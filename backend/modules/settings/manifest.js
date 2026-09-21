/**
 * Module Settings - Tools
 */

export default {
  name: 'settings',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion settings',
  description: 'Module de gestion settings',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Settings.js'
  ],
  controllers: [
    'controllers/settings.controller.js'
  ],
  routes: [
    'routes/settings.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
