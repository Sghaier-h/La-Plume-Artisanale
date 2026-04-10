/**
 * Modèle Audit
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Audit extends BaseModel {
  constructor() {
    super('audit', 'id_audit');
  }
}
