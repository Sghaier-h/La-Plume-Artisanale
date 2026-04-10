/**
 * Module Bons-retour - Sales
 */

export default {
  name: 'bons-retour',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion bons-retour',
  description: 'Module de gestion bons-retour',
  depends: ["base","commandes"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Bons-retour.js'
  ],
  controllers: [
    'controllers/bons-retour.controller.js'
  ],
  routes: [
    'routes/bons-retour.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
