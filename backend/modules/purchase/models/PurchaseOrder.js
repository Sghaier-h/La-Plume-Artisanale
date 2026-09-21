/**
 * PurchaseOrder Model - Commande d'achat
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class PurchaseOrder extends BaseModel {
  constructor() {
    super('purchase.order', null);
    this._name = 'purchase.order';
    this._description = 'Purchase Order';
  }

  async search(domain = [], options = {}) {
    let query = `
      SELECT 
        ca.*,
        f.raison_sociale as partner_name
      FROM commandes_achat ca
      LEFT JOIN fournisseurs f ON ca.id_fournisseur = f.id_fournisseur
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
      query += ` ORDER BY ca.date_commande DESC`;
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
    await this.write(idArray, { state: 'purchase' });
    return true;
  }

  async action_cancel(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    await this.write(idArray, { state: 'cancel' });
    return true;
  }

  _mapField(field) {
    const mapping = {
      'name': 'numero_commande',
      'partner_id': 'id_fournisseur',
      'state': 'statut',
      'date_order': 'date_commande',
      'amount_total': 'montant_total'
    };
    return mapping[field] || field;
  }

  _toRecord(row) {
    return {
      id: row.id_commande_achat,
      name: row.numero_commande,
      partner_id: row.id_fournisseur,
      partner_name: row.partner_name,
      state: row.statut || 'draft',
      date_order: row.date_commande,
      amount_total: parseFloat(row.montant_total || 0)
    };
  }
}

export default PurchaseOrder;
