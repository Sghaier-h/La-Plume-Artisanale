/**
 * User Model - Modèle utilisateur (Base)
 */

import BaseModel from '../../../src/core/BaseModel.js';

export class User extends BaseModel {
  constructor() {
    super('res.users');
    this._tableName = 'utilisateurs';
    this._idField = 'id_utilisateur';
    this._name = 'res.users';
    this._description = 'Users';
  }

  _sanitizeData(data) {
    const allowedFields = [
      'email', 'password', 'nom', 'prenom', 'role', 'actif',
      'derniere_connexion', 'created_by', 'updated_by'
    ];
    const sanitized = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        sanitized[field] = data[field];
      }
    }
    return sanitized;
  }
}

export default User;
