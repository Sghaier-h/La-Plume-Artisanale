/**
 * Module Selecteurs-machines - Manufacturing
 */

export default {
  name: 'selecteurs-machines',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion selecteurs-machines',
  description: 'Module de gestion selecteurs-machines',
  depends: ["base","machines"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Selecteurs-machines.js'
  ],
  controllers: [
    'controllers/selecteurs-machines.controller.js'
  ],
  routes: [
    'routes/selecteurs-machines.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
