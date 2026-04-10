/**
 * Modèle Notifications
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Notifications extends BaseModel {
  constructor() {
    super('notifications', 'id_notifications');
  }
}
