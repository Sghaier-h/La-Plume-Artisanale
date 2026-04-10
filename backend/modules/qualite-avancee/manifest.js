/**
 * Module Qualite-avancee - Quality
 */

export default {
  name: 'qualite-avancee',
  version: '1.0.0',
  category: 'Quality',
  summary: 'Gestion qualite-avancee',
  description: 'Module de gestion qualite-avancee',
  depends: ["base","quality"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/QualiteAvancee.js'
  ],
  controllers: [
    'controllers/qualite-avancee.controller.js'
  ],
  routes: [
    'routes/qualite-avancee.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
