/**
 * Modèle Machines
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Machines extends BaseModel {
  constructor() {
    super('machines');
    this._tableName = 'machines';
    this._idField = 'id_machine';
  }
}
