/**
 * Module Devis - Gestion des devis
 */

export default {
  name: 'devis',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion des devis',
  description: 'Module de gestion des devis clients',
  depends: ['base', 'clients', 'product'],
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Devis.js'
  ],
  controllers: [
    'controllers/devis.controller.js'
  ],
  routes: [
    'routes/devis.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
