/**
 * StockLocation Model - Emplacement de stock
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class StockLocation extends BaseModel {
  constructor() {
    super('stock.location', null);
    this._name = 'stock.location';
    this._description = 'Stock Location';
  }

  async search(domain = [], options = {}) {
    let query = `
      SELECT 
        e.*,
        w.nom as entrepot_nom
      FROM emplacements e
      LEFT JOIN entrepots w ON e.id_entrepot = w.id_entrepot
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    for (let i = 0; i < domain.length; i++) {
      const item = domain[i];
      if (Array.isArray(item) && item.length === 3) {
        const [field, operator, value] = item;
        paramCount++;
        
        const sqlField = this._mapField(field);
        
        if (operator === '=') {
          query += ` AND ${sqlField} = $${paramCount}`;
          params.push(value);
        }
      }
    }

    if (options.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(options.limit);
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      id: row.id_emplacement,
      name: row.nom,
      warehouse_id: row.id_entrepot,
      entrepot_nom: row.entrepot_nom,
      usage: row.usage || 'internal',
      active: row.actif !== false
    }));
  }

  _mapField(field) {
    const mapping = {
      'name': 'nom',
      'warehouse_id': 'id_entrepot',
      'usage': 'usage',
      'active': 'actif'
    };
    return mapping[field] || field;
  }
}

export default StockLocation;
