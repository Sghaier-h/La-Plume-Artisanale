/**
 * Modèle StockMultiEntrepots
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class StockMultiEntrepots extends BaseModel {
  constructor() {
    super('stock_multi_entrepots', 'id_stock');
  }
}
