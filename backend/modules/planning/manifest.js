/**
 * Module Planning - Manufacturing
 */

export default {
  name: 'planning',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion planning',
  description: 'Module de gestion planning',
  depends: ["base","of"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Planning.js'
  ],
  controllers: [
    'controllers/planning.controller.js'
  ],
  routes: [
    'routes/planning.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
