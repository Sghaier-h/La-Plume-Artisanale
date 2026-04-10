/**
 * StockWarehouse Model - Entrepôt
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class StockWarehouse extends BaseModel {
  constructor() {
    super('stock.warehouse', null);
    this._name = 'stock.warehouse';
    this._description = 'Stock Warehouse';
  }

  async search(domain = [], options = {}) {
    let query = 'SELECT * FROM entrepots WHERE 1=1';
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
        } else if (operator === 'like') {
          query += ` AND ${sqlField} ILIKE $${paramCount}`;
          params.push(`%${value}%`);
        }
      }
    }

    if (options.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(options.limit);
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      id: row.id_entrepot,
      name: row.nom,
      code: row.code,
      company_id: row.id_societe,
      active: row.actif !== false
    }));
  }

  _mapField(field) {
    const mapping = {
      'name': 'nom',
      'code': 'code',
      'company_id': 'id_societe',
      'active': 'actif'
    };
    return mapping[field] || field;
  }
}

export default StockWarehouse;
