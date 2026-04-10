/**
 * Modèle Documents
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Documents extends BaseModel {
  constructor() {
    super('documents', 'id_documents');
  }
}
