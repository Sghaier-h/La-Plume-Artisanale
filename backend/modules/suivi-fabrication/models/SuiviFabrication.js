/**
 * Modèle SuiviFabrication
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class SuiviFabrication extends BaseModel {
  constructor() {
    super('suivi_fabrication', 'id_suivi');
  }
}
