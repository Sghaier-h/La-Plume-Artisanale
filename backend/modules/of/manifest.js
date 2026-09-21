/**
 * Module Of - Manufacturing
 */

export default {
  name: 'of',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion of',
  description: 'Module de gestion of',
  depends: ["base","machines","product"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Of.js'
  ],
  controllers: [
    'controllers/of.controller.js'
  ],
  routes: [
    'routes/of.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
