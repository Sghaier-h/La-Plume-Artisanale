/**
 * Module Suivi-fabrication - Manufacturing
 */

export default {
  name: 'suivi-fabrication',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion suivi-fabrication',
  description: 'Module de gestion suivi-fabrication',
  depends: ["base","of"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Suivi-fabrication.js'
  ],
  controllers: [
    'controllers/suivi-fabrication.controller.js'
  ],
  routes: [
    'routes/suivi-fabrication.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
