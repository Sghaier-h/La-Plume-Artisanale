/**
 * Modèle Webhooks
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Webhooks extends BaseModel {
  constructor() {
    super('webhooks', 'id_webhooks');
  }
}
