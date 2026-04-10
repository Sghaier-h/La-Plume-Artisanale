/**
 * Module Utilisateurs - Tools
 */

export default {
  name: 'utilisateurs',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion utilisateurs',
  description: 'Module de gestion utilisateurs',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Utilisateurs.js'
  ],
  controllers: [
    'controllers/utilisateurs.controller.js'
  ],
  routes: [
    'routes/utilisateurs.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
