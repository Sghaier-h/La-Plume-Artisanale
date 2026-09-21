/**
 * Module Parametrage - Tools
 */

export default {
  name: 'parametrage',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion parametrage',
  description: 'Module de gestion parametrage',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Parametrage.js'
  ],
  controllers: [
    'controllers/parametrage.controller.js'
  ],
  routes: [
    'routes/parametrage.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
