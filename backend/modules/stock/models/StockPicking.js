/**
 * StockPicking Model - Réception/Livraison de stock
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class StockPicking extends BaseModel {
  constructor() {
    super('stock.picking', null);
    this._name = 'stock.picking';
    this._description = 'Stock Picking';
  }

  async search(domain = [], options = {}) {
    let query = `
      SELECT 
        l.*,
        c.raison_sociale as partner_name
      FROM livraisons l
      LEFT JOIN clients c ON l.id_commande IN (
        SELECT id_commande FROM commandes_clients WHERE id_client = c.id_client
      )
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
      query += ` ORDER BY l.date_livraison DESC`;
    } else {
      query += ` ORDER BY l.date_livraison DESC`;
    }
    if (options.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(options.limit);
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => this._toRecord(row));
  }

  async action_confirm(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    await this.write(idArray, { state: 'confirmed' });
    return true;
  }

  async action_assign(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    await this.write(idArray, { state: 'assigned' });
    return true;
  }

  async action_done(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    await this.write(idArray, { state: 'done' });
    return true;
  }

  _mapField(field) {
    const mapping = {
      'name': 'numero_livraison',
      'picking_type_id': 'type_livraison',
      'location_id': null,
      'location_dest_id': null,
      'state': 'statut',
      'partner_id': null
    };
    return mapping[field] || field;
  }

  _toRecord(row) {
    return {
      id: row.id_livraison,
      name: row.numero_livraison,
      picking_type_id: 'outgoing',
      location_id: null,
      location_dest_id: null,
      state: row.statut || 'PREVUE',
      partner_id: null,
      scheduled_date: row.date_livraison,
      date_done: null
    };
  }
}

export default StockPicking;
