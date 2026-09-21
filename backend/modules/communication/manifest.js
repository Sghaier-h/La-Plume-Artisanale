/**
 * Module Communication - Tools
 */

export default {
  name: 'communication',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion communication',
  description: 'Module de gestion communication',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Communication.js'
  ],
  controllers: [
    'controllers/communication.controller.js'
  ],
  routes: [
    'routes/communication.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
