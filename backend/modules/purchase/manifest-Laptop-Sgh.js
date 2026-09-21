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
  depends: ['base', 'product', 'stock'],
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  data: [],
  models: [
    'models/PurchaseOrder.js'
  ],
  controllers: [
    'controllers/purchase_order.controller.js'
  ],
  routes: [
    'routes/purchase_order.routes.js'
  ],
  views: [],
  security: [
    'security/ir.model.access.json'
  ],
  postLoad: null
};
