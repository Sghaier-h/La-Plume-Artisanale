/**
 * ProductCategory Model - Catégorie de produit
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class ProductCategory extends BaseModel {
  constructor() {
    super('product.category', null);
    this._name = 'product.category';
    this._description = 'Product Category';
  }

  async search(domain = [], options = {}) {
    let query = 'SELECT * FROM categories_articles WHERE 1=1';
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
      id: row.id_categorie,
      name: row.nom,
      parent_id: row.id_categorie_parent,
      complete_name: row.nom
    }));
  }

  _mapField(field) {
    const mapping = {
      'name': 'nom',
      'parent_id': 'id_categorie_parent'
    };
    return mapping[field] || field;
  }
}

export default ProductCategory;
