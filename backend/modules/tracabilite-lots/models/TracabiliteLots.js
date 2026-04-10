/**
 * Modèle TracabiliteLots
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class TracabiliteLots extends BaseModel {
  constructor() {
    super('tracabilite_lots', 'id_tracabilite');
  }
}
