/**
 * Module Commercial - Sales
 */

export default {
  name: 'commercial',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion commercial',
  description: 'Module de gestion commercial',
  depends: ["base","crm"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Commercial.js'
  ],
  controllers: [
    'controllers/commercial.controller.js'
  ],
  routes: [
    'routes/commercial.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
