/**
 * Modèle PurchaseRequests
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class PurchaseRequests extends BaseModel {
  constructor() {
    super('purchase_requests', 'id_purchase');
  }
}
