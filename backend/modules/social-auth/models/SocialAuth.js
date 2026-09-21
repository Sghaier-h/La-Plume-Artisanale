/**
 * Modèle SocialAuth
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class SocialAuth extends BaseModel {
  constructor() {
    super('social_auth', 'id_social');
  }
}
