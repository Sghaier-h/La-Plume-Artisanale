/**
 * Module Purchase - Gestion des achats
 * Inspiré du module purchase d'Odoo
 */

export default {
  name: 'purchase',
  version: '1.0.0',
  category: 'Purchases',
  summary: 'Gestion des achats - Demandes, Commandes, Réceptions',
  description: `
    Module de gestion des achats contenant :
    - Demandes d'achat (Purchase Requests)
    - Commandes d'achat (Purchase Orders)
    - Lignes de commande
    - Réceptions (Purchase Receipts)
    - États et workflow
  `,
  depends: ['base', 'product', 'stock'], // 'partner' est inclus dans 'base'
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  data: [
    'data/purchase_sequences.json',
    'data/purchase_states.json'
  ],
  models: [
    'models/PurchaseOrder.js',
    'models/PurchaseOrderLine.js'
  ],
  controllers: [
    'controllers/purchase_order.controller.js',
    'controllers/purchase_order_line.controller.js',
    'controllers/purchase_reception.controller.js'
  ],
  routes: [
    'routes/purchase_order.routes.js',
    'routes/purchase_order_line.routes.js',
    'routes/purchase_reception.routes.js'
  ],
  views: [
    'views/purchase_order_views.json',
    'views/purchase_order_line_views.json'
  ],
  security: [
    'security/ir.model.access.json',
    'security/ir_rules.json'
  ],
  postLoad: 'hooks/postLoad.js'
};
