/**
 * ProductTemplate Model - Modèle template de produit
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';
import { getTableName, getIdField, mapField, mapRecord, mapValues } from '../../../src/core/TableMapping.js';
import { loadRelations } from '../../../src/core/Relations.js';

export class ProductTemplate extends BaseModel {
  constructor() {
    super('product.product', null); // Utilise product.product pour le mapping
    this._name = 'product.product';
    this._description = 'Product';
    this._tableName = getTableName('product.product');
    this._idField = getIdField('product.product');
  }

  async search(domain = [], options = {}) {
    const tableName = this._tableName || 'articles';
    const categoryTable = getTableName('product.category');
    let query = `
      SELECT 
        a.*,
        c.nom_categorie as categorie_nom
      FROM ${tableName} a
      LEFT JOIN ${categoryTable} c ON a.id_categorie = c.id_categorie
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
          case 'like':
            query += ` AND ${sqlField} ILIKE $${paramCount}`;
            params.push(`%${value}%`);
            break;
          case 'in':
            query += ` AND ${sqlField} = ANY($${paramCount})`;
            params.push(Array.isArray(value) ? value : [value]);
            break;
        }
      }
    }

    if (options.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(options.limit);
    }
    if (options.offset) {
      query += ` OFFSET $${++paramCount}`;
      params.push(options.offset);
    }

    const result = await pool.query(query, params);
    const records = result.rows.map(row => this._toRecord(row));
    
    // Charger les relations si demandé
    if (options.loadRelations) {
      return await Promise.all(records.map(record => 
        loadRelations('product.product', record, options.loadRelations)
      ));
    }
    
    return records;
  }

  /**
   * @depends('list_price', 'standard_price')
   */
  async _compute_margin(records) {
    for (const record of records) {
      if (record.list_price && record.standard_price) {
        record.margin = record.list_price - record.standard_price;
        record.margin_percent = (record.margin / record.list_price) * 100;
      }
    }
  }

  async read(ids, options = {}) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const tableName = this._tableName || 'articles';
    const idField = this._idField || 'id_article';
    const categoryTable = getTableName('product.category');
    
    const query = `
      SELECT 
        a.*,
        c.nom_categorie as categorie_nom
      FROM ${tableName} a
      LEFT JOIN ${categoryTable} c ON a.id_categorie = c.id_categorie
      WHERE a.${idField} = ANY($1)
    `;
    
    const result = await pool.query(query, [idArray]);
    const records = result.rows.map(row => this._toRecord(row));
    
    // Charger les relations si demandé
    if (options.loadRelations) {
      return await Promise.all(records.map(record => 
        loadRelations('product.product', record, options.loadRelations)
      ));
    }
    
    return records;
  }

  _mapField(field) {
    return mapField('product.product', field);
  }

  _toRecord(row) {
    const mapped = mapRecord('product.product', row);
    // Ajouter les champs calculés
    if (row.categorie_nom) {
      mapped.categorie_nom = row.categorie_nom;
    }
    return mapped;
  }
}

export default ProductTemplate;
