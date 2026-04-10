/**
 * StockMove Model - Mouvement de stock
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class StockMove extends BaseModel {
  constructor() {
    super('stock.move', null);
    this._name = 'stock.move';
    this._description = 'Stock Move';
  }

  async search(domain = [], options = {}) {
    let query = `
      SELECT 
        m.*,
        a.nom as product_name,
        l1.nom as location_from_name,
        l2.nom as location_dest_name
      FROM mouvements_stock m
      LEFT JOIN articles a ON m.id_article = a.id_article
      LEFT JOIN emplacements l1 ON m.id_emplacement_source = l1.id_emplacement
      LEFT JOIN emplacements l2 ON m.id_emplacement_destination = l2.id_emplacement
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
        } else if (operator === 'in') {
          query += ` AND ${sqlField} = ANY($${paramCount})`;
          params.push(Array.isArray(value) ? value : [value]);
        }
      }
    }

    if (options.order) {
      query += ` ORDER BY m.date_mouvement DESC`;
    }
    if (options.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(options.limit);
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => this._toRecord(row));
  }

  _mapField(field) {
    const mapping = {
      'product_id': 'id_article',
      'location_id': 'id_emplacement_source',
      'location_dest_id': 'id_emplacement_destination',
      'state': 'statut',
      'picking_id': 'id_reception'
    };
    return mapping[field] || field;
  }

  _toRecord(row) {
    return {
      id: row.id_mouvement,
      name: row.reference || `MOV${row.id_mouvement}`,
      product_id: row.id_article,
      product_name: row.product_name,
      location_id: row.id_emplacement_source,
      location_from_name: row.location_from_name,
      location_dest_id: row.id_emplacement_destination,
      location_dest_name: row.location_dest_name,
      quantity: parseFloat(row.quantite || 0),
      state: row.statut || 'draft',
      date: row.date_mouvement,
      picking_id: row.id_reception
    };
  }
}

export default StockMove;
