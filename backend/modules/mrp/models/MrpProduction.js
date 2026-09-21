/**
 * MrpProduction Model - Ordre de fabrication
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';
import { getTableName, getIdField, mapField, mapRecord } from '../../../src/core/TableMapping.js';
import { loadRelations } from '../../../src/core/Relations.js';

export class MrpProduction extends BaseModel {
  constructor() {
    super('mrp.production', null);
    this._name = 'mrp.production';
    this._description = 'Manufacturing Order';
    this._tableName = getTableName('mrp.production') || 'ordres_fabrication';
    this._idField = getIdField('mrp.production') || 'id_of';
  }

  async search(domain = [], options = {}) {
    let query = `
      SELECT 
        of.*,
        a.nom as product_name,
        u.nom as utilisateur_nom
      FROM ordres_fabrication of
      LEFT JOIN articles a ON of.id_article = a.id_article
      LEFT JOIN utilisateurs u ON of.id_utilisateur = u.id_utilisateur
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
      query += ` ORDER BY of.date_creation DESC`;
    }
    if (options.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(options.limit);
    }

    const result = await pool.query(query, params);
    const records = result.rows.map(row => this._toRecord(row));
    
    // Charger les relations si demandé
    if (options.loadRelations) {
      return await Promise.all(records.map(record => 
        loadRelations('mrp.production', record, options.loadRelations)
      ));
    }
    
    return records;
  }

  async read(ids, options = {}) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const tableName = this._tableName || 'ordres_fabrication';
    const idField = this._idField || 'id_of';
    
    const query = `
      SELECT 
        of.*,
        a.nom as product_name,
        u.nom as utilisateur_nom
      FROM ${tableName} of
      LEFT JOIN articles a ON of.id_article = a.id_article
      LEFT JOIN utilisateurs u ON of.id_utilisateur = u.id_utilisateur
      WHERE of.${idField} = ANY($1)
    `;
    
    const result = await pool.query(query, [idArray]);
    const records = result.rows.map(row => this._toRecord(row));
    
    // Charger les relations si demandé
    if (options.loadRelations) {
      return await Promise.all(records.map(record => 
        loadRelations('mrp.production', record, options.loadRelations)
      ));
    }
    
    return records;
  }

  async action_confirm(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    await this.write(idArray, { state: 'confirmed' });
    return true;
  }

  async action_start(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    await this.write(idArray, { state: 'progress' });
    return true;
  }

  async action_done(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    await this.write(idArray, { state: 'done' });
    return true;
  }

  _mapField(field) {
    return mapField('mrp.production', field);
  }

  _toRecord(row) {
    const mapped = mapRecord('mrp.production', row);
    // Ajouter les champs calculés/joints
    if (row.product_name) mapped.product_name = row.product_name;
    if (row.utilisateur_nom) mapped.utilisateur_nom = row.utilisateur_nom;
    return mapped;
  }
}

export default MrpProduction;
