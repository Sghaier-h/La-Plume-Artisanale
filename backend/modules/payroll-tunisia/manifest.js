/**
 * Module Payroll-tunisia - HR
 */

export default {
  name: 'payroll-tunisia',
  version: '1.0.0',
  category: 'HR',
  summary: 'Gestion payroll-tunisia',
  description: 'Module de gestion payroll-tunisia',
  depends: ["base","hr"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Payroll-tunisia.js'
  ],
  controllers: [
    'controllers/payroll-tunisia.controller.js'
  ],
  routes: [
    'routes/payroll-tunisia.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
