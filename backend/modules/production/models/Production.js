/**
 * Modèle Production
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Production extends BaseModel {
  constructor() {
    super('production', 'id_production');
  }
}
