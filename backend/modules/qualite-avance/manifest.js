/**
 * Module Qualite-avance - Quality
 */

export default {
  name: 'qualite-avance',
  version: '1.0.0',
  category: 'Quality',
  summary: 'Gestion qualite-avance',
  description: 'Module de gestion qualite-avance',
  depends: ["base","quality"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Qualite-avance.js'
  ],
  controllers: [
    'controllers/qualite-avance.controller.js'
  ],
  routes: [
    'routes/qualite-avance.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
