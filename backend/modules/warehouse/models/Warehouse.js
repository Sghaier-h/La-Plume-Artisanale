/**
 * Modèle Warehouse
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Warehouse extends BaseModel {
  constructor() {
    super('warehouse', 'id_warehouse');
  }
}
