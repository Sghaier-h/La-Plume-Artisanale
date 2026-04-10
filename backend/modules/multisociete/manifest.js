/**
 * Module Multisociete - Tools
 */

export default {
  name: 'multisociete',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion multisociete',
  description: 'Module de gestion multisociete',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Multisociete.js'
  ],
  controllers: [
    'controllers/multisociete.controller.js',
    'controllers/companies.controller.js'
  ],
  routes: [
    'routes/multisociete.routes.js',
    'routes/companies.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
