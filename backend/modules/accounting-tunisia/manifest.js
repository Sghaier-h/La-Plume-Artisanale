/**
 * Module Accounting-tunisia - Accounting
 */

export default {
  name: 'accounting-tunisia',
  version: '1.0.0',
  category: 'Accounting',
  summary: 'Gestion accounting-tunisia',
  description: 'Module de gestion accounting-tunisia',
  depends: ["base","account"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Accounting-tunisia.js'
  ],
  controllers: [
    'controllers/accounting-tunisia.controller.js'
  ],
  routes: [
    'routes/accounting-tunisia.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
