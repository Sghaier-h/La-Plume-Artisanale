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

// Module CRM
import Lead from '../../modules/crm/models/Lead.js';
import Opportunity from '../../modules/crm/models/Opportunity.js';
import Stage from '../../modules/crm/models/Stage.js';
import Team from '../../modules/crm/models/Team.js';
import Activity from '../../modules/crm/models/Activity.js';

// Module HR
import Employee from '../../modules/hr/models/Employee.js';
import Department from '../../modules/hr/models/Department.js';
import Contract from '../../modules/hr/models/Contract.js';
import Applicant from '../../modules/hr/models/Applicant.js';
import RecruitmentStage from '../../modules/hr/models/RecruitmentStage.js';
import Payslip from '../../modules/hr/models/Payslip.js';

// Module Project
import Project from '../../modules/project/models/Project.js';
import Task from '../../modules/project/models/Task.js';

// Module Inventory
import Inventory from '../../modules/inventory/models/Inventory.js';

// Module Quality
import QualityCheck from '../../modules/quality/models/QualityCheck.js';
import QualityPoint from '../../modules/quality/models/QualityPoint.js';

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
  
  // CRM
  registry.register('crm.lead', Lead);
  registry.register('crm.opportunity', Opportunity);
  registry.register('crm.stage', Stage);
  registry.register('crm.team', Team);
  registry.register('crm.activity', Activity);
  
  // HR
  registry.register('hr.employee', Employee);
  registry.register('hr.department', Department);
  registry.register('hr.contract', Contract);
  registry.register('hr.applicant', Applicant);
  registry.register('hr.recruitment.stage', RecruitmentStage);
  registry.register('hr.payslip', Payslip);
  
  // Project
  registry.register('project.project', Project);
  registry.register('project.task', Task);
  
  // Inventory
  registry.register('stock.inventory', Inventory);
  
  // Quality
  registry.register('quality.check', QualityCheck);
  registry.register('quality.point', QualityPoint);
  
  console.log('✅ Tous les modèles enregistrés dans le registre');
}

export default registerAllModels;
