/**
 * Module Parametres-catalogue - Sales
 */

export default {
  name: 'parametres-catalogue',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion parametres-catalogue',
  description: 'Module de gestion parametres-catalogue',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Parametres-catalogue.js'
  ],
  controllers: [
    'controllers/parametres-catalogue.controller.js'
  ],
  routes: [
    'routes/parametres-catalogue.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
