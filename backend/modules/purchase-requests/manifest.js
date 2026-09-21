/**
 * Module Purchase-requests - Purchase
 */

export default {
  name: 'purchase-requests',
  version: '1.0.0',
  category: 'Purchase',
  summary: 'Gestion purchase-requests',
  description: 'Module de gestion purchase-requests',
  depends: ["base","purchase"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Purchase-requests.js'
  ],
  controllers: [
    'controllers/purchase-requests.controller.js'
  ],
  routes: [
    'routes/purchase-requests.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
