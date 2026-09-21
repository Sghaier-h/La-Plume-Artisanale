/**
 * Module Sale - Gestion des ventes
 * Inspiré du module sale d'Odoo
 */

export default {
  name: 'sale',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion des ventes - Devis, Commandes, Factures',
  description: `
    Module de gestion des ventes contenant :
    - Devis (Quotations)
    - Commandes de vente (Sales Orders)
    - Lignes de commande
    - Factures
    - États et workflow
  `,
  depends: ['base', 'product'],
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  data: [],
  models: [
    'models/SaleOrder.js',
    'models/SaleOrderLine.js'
  ],
  controllers: [
    'controllers/sale_order.controller.js'
  ],
  routes: [
    'routes/sale_order.routes.js'
  ],
  views: [
    'views/sale_order_views.json'
  ],
  security: [
    'security/ir.model.access.json',
    'security/ir_rules.json'
  ],
  postLoad: null
};
