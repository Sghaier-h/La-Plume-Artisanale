/**
 * Module Social-auth - Tools
 */

export default {
  name: 'social-auth',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion social-auth',
  description: 'Module de gestion social-auth',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Social-auth.js'
  ],
  controllers: [
    'controllers/social-auth.controller.js'
  ],
  routes: [
    'routes/social-auth.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
