/**
 * Modèle Fournisseur
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Fournisseur extends BaseModel {
  constructor() {
    super('fournisseurs', 'id_fournisseur');
  }
}
