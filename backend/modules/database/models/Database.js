/**
 * Modèle Database
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Database extends BaseModel {
  constructor() {
    super('database', 'id_database');
  }
}
