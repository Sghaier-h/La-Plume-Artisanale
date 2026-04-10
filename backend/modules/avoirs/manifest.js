/**
 * Module Avoirs - Accounting
 */

export default {
  name: 'avoirs',
  version: '1.0.0',
  category: 'Accounting',
  summary: 'Gestion avoirs',
  description: 'Module de gestion avoirs',
  depends: ["base","factures"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Avoirs.js'
  ],
  controllers: [
    'controllers/avoirs.controller.js'
  ],
  routes: [
    'routes/avoirs.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
