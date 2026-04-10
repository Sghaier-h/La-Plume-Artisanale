/**
 * Module Messages - Tools
 */

export default {
  name: 'messages',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion messages',
  description: 'Module de gestion messages',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Messages.js'
  ],
  controllers: [
    'controllers/messages.controller.js'
  ],
  routes: [
    'routes/messages.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
