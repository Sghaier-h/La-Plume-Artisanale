/**
 * Module Planification-gantt - Project
 */

export default {
  name: 'planification-gantt',
  version: '1.0.0',
  category: 'Project',
  summary: 'Gestion planification-gantt',
  description: 'Module de gestion planification-gantt',
  depends: ["base","project"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Planification-gantt.js'
  ],
  controllers: [
    'controllers/planification-gantt.controller.js'
  ],
  routes: [
    'routes/planification-gantt.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
