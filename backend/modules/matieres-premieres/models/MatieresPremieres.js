/**
 * Modèle MatieresPremieres
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class MatieresPremieres extends BaseModel {
  constructor() {
    super('matieres_premieres');
    this._tableName = 'matieres_premieres';
    this._idField = 'id_mp';
  }
}
