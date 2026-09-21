/**
 * Module Modeles - Sales
 */

export default {
  name: 'modeles',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion modeles',
  description: 'Module de gestion modeles',
  depends: ["base","product"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Modeles.js'
  ],
  controllers: [
    'controllers/modeles.controller.js'
  ],
  routes: [
    'routes/modeles.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
