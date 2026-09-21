/**
 * Modèle Facture
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Facture extends BaseModel {
  constructor() {
    super('factures', 'id_facture');
  }
}
