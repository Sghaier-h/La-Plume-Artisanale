/**
 * Module Commandes - Gestion des commandes
 */

export default {
  name: 'commandes',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion des commandes',
  description: 'Module de gestion des commandes clients',
  depends: ['base', 'clients', 'product'],
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Commande.js'
  ],
  controllers: [
    'controllers/commandes.controller.js'
  ],
  routes: [
    'routes/commandes.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
