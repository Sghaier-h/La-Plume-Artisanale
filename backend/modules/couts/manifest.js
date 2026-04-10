/**
 * Module Couts - Accounting
 */

export default {
  name: 'couts',
  version: '1.0.0',
  category: 'Accounting',
  summary: 'Gestion couts',
  description: 'Module de gestion couts',
  depends: ["base","account"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Couts.js'
  ],
  controllers: [
    'controllers/couts.controller.js'
  ],
  routes: [
    'routes/couts.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
