/**
 * Module Ecommerce - Sales
 */

export default {
  name: 'ecommerce',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion ecommerce',
  description: 'Module de gestion ecommerce',
  depends: ["base","product"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Ecommerce.js'
  ],
  controllers: [
    'controllers/ecommerce.controller.js',
    'controllers/ecommerce_product.controller.js',
    'controllers/ecommerce_order.controller.js',
    'controllers/ecommerce_settings.controller.js'
  ],
  routes: [
    'routes/ecommerce.routes.js',
    'routes/ecommerce_product.routes.js',
    'routes/ecommerce_order.routes.js',
    'routes/ecommerce_settings.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
