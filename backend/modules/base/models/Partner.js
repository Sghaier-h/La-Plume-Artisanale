/**
 * Partner Model - Modèle partenaire (clients/fournisseurs)
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class Partner extends BaseModel {
  constructor() {
    super('res.partner', null); // Utilise SQL direct
    this._name = 'res.partner';
    this._description = 'Partners';
  }

  async search(domain = [], options = {}) {
    let query = 'SELECT * FROM comptes WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Convertir le domaine en conditions SQL
    for (let i = 0; i < domain.length; i++) {
      const item = domain[i];
      if (Array.isArray(item) && item.length === 3) {
        const [field, operator, value] = item;
        paramCount++;
        
        // Mapper les champs Odoo vers SQL
        const sqlField = this._mapField(field);
        
        switch (operator) {
          case '=':
            query += ` AND ${sqlField} = $${paramCount}`;
            params.push(value);
            break;
          case '!=':
            query += ` AND ${sqlField} != $${paramCount}`;
            params.push(value);
            break;
          case 'like':
            query += ` AND ${sqlField} ILIKE $${paramCount}`;
            params.push(`%${value}%`);
            break;
          case 'in':
            query += ` AND ${sqlField} = ANY($${paramCount})`;
            params.push(Array.isArray(value) ? value : [value]);
            break;
        }
      }
    }

    // Pagination
    if (options.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(options.limit);
    }
    if (options.offset) {
      query += ` OFFSET $${++paramCount}`;
      params.push(options.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  _mapField(field) {
    const mapping = {
      'name': 'raison_sociale',
      'email': 'email',
      'phone': 'telephone',
      'is_company': 'est_entreprise',
      'customer': 'est_client',
      'supplier': 'est_fournisseur'
    };
    return mapping[field] || field;
  }
}

export default Partner;
