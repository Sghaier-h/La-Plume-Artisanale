/**
 * Module Pos - Sales
 */

export default {
  name: 'pos',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion pos',
  description: 'Module de gestion pos',
  depends: ["base","product"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Pos.js'
  ],
  controllers: [
    'controllers/pos.controller.js',
    'controllers/pos_caisse.controller.js',
    'controllers/pos_session.controller.js',
    'controllers/pos_vente.controller.js'
  ],
  routes: [
    'routes/pos.routes.js',
    'routes/pos_caisse.routes.js',
    'routes/pos_session.routes.js',
    'routes/pos_vente.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
