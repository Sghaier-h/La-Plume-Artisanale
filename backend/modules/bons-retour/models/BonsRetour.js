/**
 * Modèle BonsRetour
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class BonsRetour extends BaseModel {
  constructor() {
    super('bons_retour');
    this._tableName = 'bons_retour';
    this._idField = 'id_retour';
  }
}
