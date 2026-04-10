/**
 * Modèle Migration
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Migration extends BaseModel {
  constructor() {
    super('migration', 'id_migration');
  }
}
