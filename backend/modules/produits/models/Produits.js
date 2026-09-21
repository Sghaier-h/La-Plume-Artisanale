/**
 * Modèle Produits
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Produits extends BaseModel {
  constructor() {
    super('produits', 'id_produits');
  }
}
