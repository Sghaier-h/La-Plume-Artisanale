/**
 * ModelRegistry - Enregistre tous les modèles dans le registre
 */

import { registry } from './Environment.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const modulesPath = join(__dirname, '../../modules');

// Module Base
import User from '../../modules/base/models/User.js';
import Partner from '../../modules/base/models/Partner.js';

// Module Sale
import SaleOrder from '../../modules/sale/models/SaleOrder.js';
import SaleOrderLine from '../../modules/sale/models/SaleOrderLine.js';

// Module Product
import ProductTemplate from '../../modules/product/models/ProductTemplate.js';
import ProductCategory from '../../modules/product/models/ProductCategory.js';

// Module Stock
import StockWarehouse from '../../modules/stock/models/StockWarehouse.js';
import StockLocation from '../../modules/stock/models/StockLocation.js';
import StockMove from '../../modules/stock/models/StockMove.js';
import StockPicking from '../../modules/stock/models/StockPicking.js';

// Module MRP
import MrpProduction from '../../modules/mrp/models/MrpProduction.js';
import MrpBOM from '../../modules/mrp/models/MrpBOM.js';

// Module Account
import AccountMove from '../../modules/account/models/AccountMove.js';

// Module Purchase
import PurchaseOrder from '../../modules/purchase/models/PurchaseOrder.js';

/**
 * Enregistre tous les modèles
 */
export function registerAllModels() {
  // Base
  registry.register('res.users', User);
  registry.register('res.partner', Partner);
  
  // Sale
  registry.register('sale.order', SaleOrder);
  registry.register('sale.order.line', SaleOrderLine);
  
  // Product
  registry.register('product.template', ProductTemplate);
  registry.register('product.category', ProductCategory);
  
  // Stock
  registry.register('stock.warehouse', StockWarehouse);
  registry.register('stock.location', StockLocation);
  registry.register('stock.move', StockMove);
  registry.register('stock.picking', StockPicking);
  
  // MRP
  registry.register('mrp.production', MrpProduction);
  registry.register('mrp.bom', MrpBOM);
  
  // Account
  registry.register('account.move', AccountMove);
  
  // Purchase
  registry.register('purchase.order', PurchaseOrder);
  
  console.log('✅ Tous les modèles enregistrés dans le registre');
}

export default registerAllModels;
