/**
 * Module Produits - Inventory
 */

export default {
  name: 'produits',
  version: '1.0.0',
  category: 'Inventory',
  summary: 'Gestion produits',
  description: 'Module de gestion produits',
  depends: ["base","product"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Produits.js'
  ],
  controllers: [
    'controllers/produits.controller.js'
  ],
  routes: [
    'routes/produits.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
