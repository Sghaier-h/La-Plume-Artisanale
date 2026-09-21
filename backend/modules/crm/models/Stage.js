/**
 * Stage Model - Modèle pour les étapes du pipeline CRM
 */

import BaseModel from '../../../src/core/BaseModel.js';

class Stage extends BaseModel {
  static _name = 'crm.stage';
  static _description = 'Étape du pipeline CRM';
  static _table = 'crm_stage';
  static _orderBy = 'sequence ASC';

  static _fields = {
    name: { type: 'char', string: 'Nom', required: true },
    sequence: { type: 'integer', string: 'Séquence', default: 0 },
    probability: { type: 'float', string: 'Probabilité (%)', default: 0.0 },
    team_id: { type: 'many2one', relation: 'crm.team', string: 'Équipe' },
    fold: { type: 'boolean', string: 'Repliée', default: false },
    active: { type: 'boolean', string: 'Actif', default: true },
  };

  static _mapField(fieldName) {
    const mapping = {
      'team_id': 'id_team',
      'sequence': 'ordre'
    };
    return mapping[fieldName] || fieldName;
  }
}

export default Stage;
