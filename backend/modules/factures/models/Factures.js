/**
 * Modèle Factures
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Factures extends BaseModel {
  constructor() {
    super('factures', 'id_factures');
  }
}
