/**
 * Modèle Taches
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Taches extends BaseModel {
  constructor() {
    super('taches', 'id_taches');
  }
}
