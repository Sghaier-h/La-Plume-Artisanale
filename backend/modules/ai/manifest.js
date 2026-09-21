/**
 * Module Ai - Tools
 */

export default {
  name: 'ai',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion ai',
  description: 'Module de gestion ai',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Ai.js'
  ],
  controllers: [
    'controllers/ai.controller.js'
  ],
  routes: [
    'routes/ai.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
