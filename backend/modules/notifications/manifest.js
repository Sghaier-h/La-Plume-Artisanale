/**
 * Module Notifications - Tools
 */

export default {
  name: 'notifications',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion notifications',
  description: 'Module de gestion notifications',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Notifications.js'
  ],
  controllers: [
    'controllers/notifications.controller.js'
  ],
  routes: [
    'routes/notifications.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
