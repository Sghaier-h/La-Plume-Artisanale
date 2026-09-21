/**
 * Module Documents - Tools
 */

export default {
  name: 'documents',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion documents',
  description: 'Module de gestion documents',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Documents.js'
  ],
  controllers: [
    'controllers/documents.controller.js'
  ],
  routes: [
    'routes/documents.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
