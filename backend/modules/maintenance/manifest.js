/**
 * Module Maintenance - Manufacturing
 */

export default {
  name: 'maintenance',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion maintenance',
  description: 'Module de gestion maintenance',
  depends: ["base","machines"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Maintenance.js'
  ],
  controllers: [
    'controllers/maintenance.controller.js'
  ],
  routes: [
    'routes/maintenance.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
