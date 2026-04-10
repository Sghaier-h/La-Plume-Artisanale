/**
 * Module Fournisseurs - Gestion des fournisseurs
 */

export default {
  name: 'fournisseurs',
  version: '1.0.0',
  category: 'Purchase',
  summary: 'Gestion des fournisseurs',
  description: 'Module de gestion des fournisseurs',
  depends: ['base'],
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Fournisseur.js'
  ],
  controllers: [
    'controllers/fournisseurs.controller.js'
  ],
  routes: [
    'routes/fournisseurs.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
