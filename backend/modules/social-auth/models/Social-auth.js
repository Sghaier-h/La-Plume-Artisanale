/**
 * SocialAuth Model - Module social-auth
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class SocialAuth extends BaseModel {
  constructor() {
    super('social-auth.socialauth', null);
    this._name = 'social-auth.socialauth';
    this._description = 'SocialAuth';
    this._table = 'social-auths';
    this._idField = 'id';
  }

  async search(domain = [], options = {}) {
    let query = `SELECT * FROM social-auths WHERE 1=1`;
    const params = [];
    let paramCount = 0;

    // Convertir le domaine en conditions SQL
    for (let i = 0; i < domain.length; i++) {
      const item = domain[i];
      if (Array.isArray(item) && item.length === 3) {
        const [field, operator, value] = item;
        paramCount++;
        
        switch (operator) {
          case '=':
            query += ` AND ${field} = $${paramCount}`;
            params.push(value);
            break;
          case '!=':
            query += ` AND ${field} != $${paramCount}`;
            params.push(value);
            break;
          case 'like':
          case 'ilike':
            query += ` AND ${field} ILIKE $${paramCount}`;
            params.push(`%${value}%`);
            break;
          case 'in':
            query += ` AND ${field} = ANY($${paramCount})`;
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
}

export default SocialAuth;
