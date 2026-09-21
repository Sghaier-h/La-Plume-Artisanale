/**
 * Modèle Settings
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Settings extends BaseModel {
  constructor() {
    super('settings', 'id_settings');
  }
}
