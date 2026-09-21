/**
 * Modèle Commande
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Commande extends BaseModel {
  constructor() {
    super('commandes', 'id_commande');
  }
}
