/**
 * Module Whatsapp - Tools
 */

export default {
  name: 'whatsapp',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion whatsapp',
  description: 'Module de gestion whatsapp',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Whatsapp.js'
  ],
  controllers: [
    'controllers/whatsapp.controller.js'
  ],
  routes: [
    'routes/whatsapp.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
