/**
 * Modèle Devis
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Devis extends BaseModel {
  constructor() {
    super('devis', 'id_devis');
  }
}
