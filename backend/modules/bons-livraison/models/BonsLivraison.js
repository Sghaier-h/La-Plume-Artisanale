/**
 * Modèle BonsLivraison
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class BonsLivraison extends BaseModel {
  constructor() {
    super('bons_livraison');
    this._tableName = 'bons_livraison';
    this._idField = 'id_bl';
  }
}
