/**
 * Modèle Maintenance
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Maintenance extends BaseModel {
  constructor() {
    super('maintenance', 'id_maintenance');
  }
}
