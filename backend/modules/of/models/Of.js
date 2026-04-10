/**
 * Modèle Of
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Of extends BaseModel {
  constructor() {
    super('ordres_fabrication');
    this._tableName = 'ordres_fabrication';
    this._idField = 'id_of';
  }
}
