/**
 * Module Factures - Gestion des factures
 */

export default {
  name: 'factures',
  version: '1.0.0',
  category: 'Accounting',
  summary: 'Gestion des factures',
  description: 'Module de gestion des factures clients',
  depends: ['base', 'clients', 'account', 'sale'],
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Facture.js'
  ],
  controllers: [
    'controllers/factures.controller.js'
  ],
  routes: [
    'routes/factures.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
