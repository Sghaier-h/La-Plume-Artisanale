/**
 * Module Stock - Gestion des stocks
 * Inspiré du module stock d'Odoo
 */

export default {
  name: 'stock',
  version: '1.0.0',
  category: 'Inventory',
  summary: 'Gestion des stocks et entrepôts',
  description: `
    Module de gestion des stocks contenant :
    - Entrepôts (Warehouses)
    - Emplacements (Locations)
    - Mouvements de stock (Stock Moves)
    - Réceptions (Stock Pickings)
    - Inventaires
    - Lots et séries
  `,
  depends: ['base', 'product'],
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  data: [],
  models: [
    'models/StockWarehouse.js',
    'models/StockLocation.js',
    'models/StockMove.js',
    'models/StockPicking.js'
  ],
  controllers: [
    'controllers/stock_picking.controller.js'
  ],
  routes: [
    'routes/stock_picking.routes.js'
  ],
  views: [],
  security: [
    'security/ir.model.access.json'
  ],
  postLoad: null
};
