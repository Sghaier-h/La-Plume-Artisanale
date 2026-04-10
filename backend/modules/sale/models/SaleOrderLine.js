/**
 * SaleOrderLine Model - Ligne de commande de vente
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class SaleOrderLine extends BaseModel {
  constructor() {
    super('sale.order.line', null);
    this._name = 'sale.order.line';
    this._description = 'Sales Order Line';
  }

  async search(domain = [], options = {}) {
    let query = `
      SELECT 
        lc.*,
        a.nom as product_name,
        a.reference as product_reference
      FROM lignes_commande lc
      LEFT JOIN articles_catalogue a ON lc.id_article = a.id_article
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
        
        switch (operator) {
          case '=':
            query += ` AND ${sqlField} = $${paramCount}`;
            params.push(value);
            break;
          case '>':
            query += ` AND ${sqlField} > $${paramCount}`;
            params.push(value);
            break;
          case '<':
            query += ` AND ${sqlField} < $${paramCount}`;
            params.push(value);
            break;
        }
      }
    }

    if (options.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(options.limit);
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => this._toRecord(row));
  }

  /**
   * @depends('quantity', 'price_unit', 'discount')
   */
  async _compute_price_total(records) {
    for (const record of records) {
      const subtotal = (record.quantity || 0) * (record.price_unit || 0);
      const discount = (record.discount || 0) / 100;
      record.price_subtotal = subtotal * (1 - discount);
      record.price_total = record.price_subtotal + (record.price_tax || 0);
    }
  }

  _mapField(field) {
    const mapping = {
      'order_id': 'id_commande',
      'product_id': 'id_article',
      'quantity': 'quantite_commandee',
      'price_unit': 'prix_unitaire_ht',
      'discount': 'remise',
      'price_subtotal': 'montant_ht',
      'price_total': 'montant_ttc'
    };
    return mapping[field] || field;
  }

  _toRecord(row) {
    return {
      id: row.id_ligne,
      order_id: row.id_commande,
      product_id: row.id_article,
      product_name: row.product_name,
      product_reference: row.product_reference,
      quantity: parseFloat(row.quantite_commandee || 0),
      price_unit: parseFloat(row.prix_unitaire_ht || 0),
      discount: parseFloat(row.remise || 0),
      price_subtotal: parseFloat(row.montant_ht || 0),
      price_total: parseFloat(row.montant_ttc || 0),
      price_tax: parseFloat(row.montant_tva || 0)
    };
  }
}

export default SaleOrderLine;
