/**
 * Module Soustraitants - Manufacturing
 */

export default {
  name: 'soustraitants',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion soustraitants',
  description: 'Module de gestion soustraitants',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Soustraitants.js'
  ],
  controllers: [
    'controllers/soustraitants.controller.js'
  ],
  routes: [
    'routes/soustraitants.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
