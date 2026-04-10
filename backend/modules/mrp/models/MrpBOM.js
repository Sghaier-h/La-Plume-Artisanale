/**
 * MrpBOM Model - Nomenclature (Bill of Materials)
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class MrpBOM extends BaseModel {
  constructor() {
    super('mrp.bom', null);
    this._name = 'mrp.bom';
    this._description = 'Bill of Materials';
  }

  async search(domain = [], options = {}) {
    let query = `
      SELECT 
        n.*,
        a1.nom as product_name,
        a2.nom as component_name
      FROM nomenclatures n
      LEFT JOIN articles a1 ON n.id_article_produit = a1.id_article
      LEFT JOIN articles a2 ON n.id_article_composant = a2.id_article
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
      id: row.id_nomenclature,
      product_id: row.id_article_produit,
      product_name: row.product_name,
      product_tmpl_id: row.id_article_produit,
      product_qty: parseFloat(row.quantite_produit || 1),
      bom_line_ids: [], // À charger séparément
      active: row.actif !== false
    }));
  }

  _mapField(field) {
    const mapping = {
      'product_id': 'id_article_produit',
      'product_tmpl_id': 'id_article_produit',
      'active': 'actif'
    };
    return mapping[field] || field;
  }
}

export default MrpBOM;
