/**
 * Module Machines - Manufacturing
 */

export default {
  name: 'machines',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion machines',
  description: 'Module de gestion machines',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Machines.js'
  ],
  controllers: [
    'controllers/machines.controller.js'
  ],
  routes: [
    'routes/machines.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
