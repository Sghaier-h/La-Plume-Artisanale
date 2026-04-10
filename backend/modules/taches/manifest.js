/**
 * Module Taches - Project
 */

export default {
  name: 'taches',
  version: '1.0.0',
  category: 'Project',
  summary: 'Gestion taches',
  description: 'Module de gestion taches',
  depends: ["base","project"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Taches.js'
  ],
  controllers: [
    'controllers/taches.controller.js'
  ],
  routes: [
    'routes/taches.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
