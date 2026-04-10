/**
 * Team Model - Modèle pour les équipes de vente CRM
 */

import BaseModel from '../../../src/core/BaseModel.js';

class Team extends BaseModel {
  static _name = 'crm.team';
  static _description = 'Équipe de vente CRM';
  static _table = 'crm_team';
  static _orderBy = 'name ASC';

  static _fields = {
    name: { type: 'char', string: 'Nom', required: true },
    sequence: { type: 'integer', string: 'Séquence', default: 0 },
    active: { type: 'boolean', string: 'Actif', default: true },
    member_ids: { type: 'many2many', relation: 'res.users', string: 'Membres' },
    user_id: { type: 'many2one', relation: 'res.users', string: 'Chef d\'équipe' },
  };

  static _mapField(fieldName) {
    const mapping = {
      'user_id': 'id_chef',
      'member_ids': 'membres'
    };
    return mapping[fieldName] || fieldName;
  }
}

export default Team;
