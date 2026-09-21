/**
 * Modèle Utilisateurs
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class Utilisateurs extends BaseModel {
  constructor() {
    super('utilisateurs');
    this._tableName = 'utilisateurs';
    this._idField = 'id_utilisateur';
  }
}
