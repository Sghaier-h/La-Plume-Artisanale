/**
 * Module Search - Tools
 */

export default {
  name: 'search',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion search',
  description: 'Module de gestion search',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Search.js'
  ],
  controllers: [
    'controllers/search.controller.js'
  ],
  routes: [
    'routes/search.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
