/**
 * Module Webhooks - Tools
 */

export default {
  name: 'webhooks',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion webhooks',
  description: 'Module de gestion webhooks',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Webhooks.js'
  ],
  controllers: [
    'controllers/webhooks.controller.js'
  ],
  routes: [
    'routes/webhooks.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
