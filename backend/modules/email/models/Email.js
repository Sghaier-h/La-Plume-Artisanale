/**
 * Modèle Email
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Email extends BaseModel {
  constructor() {
    super('email', 'id_email');
  }
}
