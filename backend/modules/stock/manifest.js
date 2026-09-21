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
  data: [
    'data/stock_warehouses.json',
    'data/stock_locations.json',
    'data/stock_move_types.json'
  ],
  models: [
    'models/StockWarehouse.js',
    'models/StockLocation.js',
    'models/StockMove.js',
    'models/StockPicking.js',
    'models/StockQuant.js',
    'models/StockLot.js'
  ],
  controllers: [
    'controllers/stock_warehouse.controller.js',
    'controllers/stock_location.controller.js',
    'controllers/stock_move.controller.js',
    'controllers/stock_picking.controller.js',
    'controllers/stock_quant.controller.js',
    'controllers/stock_lot.controller.js'
  ],
  routes: [
    'routes/stock.routes.js',
    'routes/stock_warehouse.routes.js',
    'routes/stock_location.routes.js',
    'routes/stock_move.routes.js',
    'routes/stock_picking.routes.js',
    'routes/stock_quant.routes.js',
    'routes/stock_lot.routes.js'
  ],
  apiPaths: {
    'routes/stock.routes.js': '/api/stock'
  },
  views: [
    'views/stock_warehouse_views.json',
    'views/stock_location_views.json',
    'views/stock_move_views.json',
    'views/stock_picking_views.json'
  ],
  security: [
    'security/ir.model.access.json',
    'security/ir_rules.json'
  ],
  postLoad: 'hooks/postLoad.js'
};
