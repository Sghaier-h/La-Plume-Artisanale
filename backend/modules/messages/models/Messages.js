/**
 * Modèle Messages
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Messages extends BaseModel {
  constructor() {
    super('messages', 'id_messages');
  }
}
