/**
 * Module Pointage - HR
 */

export default {
  name: 'pointage',
  version: '1.0.0',
  category: 'HR',
  summary: 'Gestion pointage',
  description: 'Module de gestion pointage',
  depends: ["base","hr"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Pointage.js'
  ],
  controllers: [
    'controllers/pointage.controller.js'
  ],
  routes: [
    'routes/pointage.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
