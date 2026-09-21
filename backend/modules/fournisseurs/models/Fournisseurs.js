/**
 * Modèle Fournisseurs
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Fournisseurs extends BaseModel {
  constructor() {
    super('fournisseurs', 'id_fournisseurs');
  }
}
