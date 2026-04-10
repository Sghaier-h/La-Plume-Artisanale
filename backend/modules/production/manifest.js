/**
 * Module Production - Manufacturing
 */

export default {
  name: 'production',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion production',
  description: 'Module de gestion production',
  depends: ["base","of"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Production.js'
  ],
  controllers: [
    'controllers/production.controller.js'
  ],
  routes: [
    'routes/production.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
