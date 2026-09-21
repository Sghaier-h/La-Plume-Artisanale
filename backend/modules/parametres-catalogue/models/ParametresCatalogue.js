/**
 * Modèle ParametresCatalogue
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class ParametresCatalogue extends BaseModel {
  constructor() {
    super('parametres_catalogue', 'id_parametres');
  }
}
