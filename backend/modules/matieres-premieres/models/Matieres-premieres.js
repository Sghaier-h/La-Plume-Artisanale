/**
 * MatieresPremieres Model - Module matieres-premieres
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class MatieresPremieres extends BaseModel {
  constructor() {
    super('matieres-premieres.matierespremieres', null);
    this._name = 'matieres-premieres.matierespremieres';
    this._description = 'MatieresPremieres';
    this._table = 'matieres-premieres';
    this._idField = 'id';
  }

  async search(domain = [], options = {}) {
    let query = `SELECT * FROM matieres-premieres WHERE 1=1`;
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

export default MatieresPremieres;
