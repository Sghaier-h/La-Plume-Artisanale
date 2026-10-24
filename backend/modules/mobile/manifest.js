/**
 * Module Mobile - Tools
 */

export default {
  name: 'mobile',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion mobile',
  description: 'Module de gestion mobile',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Mobile.js'
  ],
  controllers: [
    'controllers/mobile.controller.js'
  ],
  routes: [
    'routes/mobile.routes.js'
  ],
  apiPaths: {
    'routes/mobile.routes.js': '/api/v1/mobile'
  },
  security: [
    'security/ir.model.access.json'
  ]
};
