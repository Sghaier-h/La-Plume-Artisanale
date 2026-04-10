/**
 * Modèle Avoirs
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Avoirs extends BaseModel {
  constructor() {
    super('avoirs');
    this._tableName = 'avoirs';
    this._idField = 'id_avoir';
  }
}
