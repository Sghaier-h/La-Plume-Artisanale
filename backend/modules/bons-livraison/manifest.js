/**
 * Module Bons-livraison - Sales
 */

export default {
  name: 'bons-livraison',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion bons-livraison',
  description: 'Module de gestion bons-livraison',
  depends: ["base","commandes"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Bons-livraison.js'
  ],
  controllers: [
    'controllers/bons-livraison.controller.js'
  ],
  routes: [
    'routes/bons-livraison.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
