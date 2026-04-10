/**
 * Module Email - Tools
 */

export default {
  name: 'email',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion email',
  description: 'Module de gestion email',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Email.js'
  ],
  controllers: [
    'controllers/email.controller.js'
  ],
  routes: [
    'routes/email.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
