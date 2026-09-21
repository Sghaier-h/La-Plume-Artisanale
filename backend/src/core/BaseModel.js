/**
 * BaseModel - Classe de base pour tous les modèles inspirée d'Odoo
 * Fournit les fonctionnalités ORM de base : search, read, write, create, unlink
 * Utilise pg pool pour toutes les opérations SQL
 */

import { pool } from '../utils/db.js';

export class BaseModel {
  constructor(modelName) {
    this.modelName = modelName;
    this._tableName = modelName; // À surcharger dans les sous-classes
    this._idField = 'id';       // À surcharger dans les sous-classes
    this.env = null;
  }

  /**
   * Définit l'environnement (utilisateur, contexte)
   */
  setEnvironment(env) {
    this.env = env;
    return this;
  }

  /**
   * Recherche des enregistrements avec domaine (filtres)
   */
  async search(domain = [], options = {}) {
    const {
      limit = null,
      offset = 0,
      order = null,
      fields = null
    } = options;

    const selectFields = fields ? fields.join(', ') : '*';
    let query = `SELECT ${selectFields} FROM ${this._tableName}`;
    const params = [];

    // Convertir le domaine en WHERE SQL
    const whereClause = this._domainToSQL(domain, params);
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }

    if (order) {
      query += ` ORDER BY ${order}`;
    }

    if (limit) {
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const result = await pool.query(query, params);
    return result.rows.map(record => this._toRecord(record));
  }

  /**
   * Lit un ou plusieurs enregistrements par ID
   */
  async read(ids, options = {}) {
    const { fields = null } = options;
    const idArray = Array.isArray(ids) ? ids : [ids];
    const selectFields = fields ? fields.join(', ') : '*';

    const query = `SELECT ${selectFields} FROM ${this._tableName} WHERE ${this._idField} = ANY($1)`;
    const result = await pool.query(query, [idArray]);
    return result.rows.map(record => this._toRecord(record));
  }

  /**
   * Crée un ou plusieurs enregistrements
   */
  async create(vals) {
    const valsList = Array.isArray(vals) ? vals : [vals];
    const results = [];

    for (const valsItem of valsList) {
      const data = await this._prepareCreateData(valsItem);
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const query = `
        INSERT INTO ${this._tableName} (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await pool.query(query, values);
      results.push(this._toRecord(result.rows[0]));
    }

    return Array.isArray(vals) ? results : results[0];
  }

  /**
   * Modifie un ou plusieurs enregistrements
   */
  async write(ids, vals) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const data = await this._prepareWriteData(vals);
    const fields = Object.keys(data);
    const values = Object.values(data);

    // SET field1 = $2, field2 = $3, ...
    const setClause = fields.map((key, i) => `${key} = $${i + 2}`).join(', ');

    for (const id of idArray) {
      const query = `
        UPDATE ${this._tableName}
        SET ${setClause}
        WHERE ${this._idField} = $1
        RETURNING *
      `;
      await pool.query(query, [id, ...values]);
    }

    return await this.read(idArray);
  }

  /**
   * Supprime un ou plusieurs enregistrements
   */
  async unlink(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];

    const query = `DELETE FROM ${this._tableName} WHERE ${this._idField} = ANY($1) RETURNING ${this._idField}`;
    const result = await pool.query(query, [idArray]);
    return result.rows;
  }

  /**
   * Browse - Accès lazy aux enregistrements
   */
  browse(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    return new RecordSet(this, idArray);
  }

  /**
   * Convertit un domaine Odoo en WHERE SQL avec requêtes paramétrées
   */
  _domainToSQL(domain, params = []) {
    if (!domain || domain.length === 0) return null;

    const conditions = [];

    for (let i = 0; i < domain.length; i++) {
      const item = domain[i];

      if (item === '&') {
        conditions.push('AND');
      } else if (item === '|') {
        conditions.push('OR');
      } else if (item === '!') {
        conditions.push('NOT');
      } else if (Array.isArray(item) && item.length === 3) {
        const [field, operator, value] = item;
        conditions.push(this._buildCondition(field, operator, value, params));
      }
    }

    return conditions.length > 0 ? conditions.join(' ') : null;
  }

  /**
   * Construit une condition SQL paramétrée
   */
  _buildCondition(field, operator, value, params) {
    const paramIndex = params.length + 1;

    switch (operator) {
      case '=':
        params.push(value);
        return `${field} = $${paramIndex}`;
      case '!=':
      case '<>':
        params.push(value);
        return `${field} != $${paramIndex}`;
      case '>':
      case '>=':
      case '<':
      case '<=':
        params.push(value);
        return `${field} ${operator} $${paramIndex}`;
      case 'like':
        params.push(`%${value}%`);
        return `${field} LIKE $${paramIndex}`;
      case 'ilike':
        params.push(`%${value}%`);
        return `${field} ILIKE $${paramIndex}`;
      case 'in':
        params.push(Array.isArray(value) ? value : [value]);
        return `${field} = ANY($${paramIndex})`;
      case 'not in':
        params.push(Array.isArray(value) ? value : [value]);
        return `${field} != ALL($${paramIndex})`;
      default:
        params.push(value);
        return `${field} = $${paramIndex}`;
    }
  }

  /**
   * Prépare les données pour la création
   */
  async _prepareCreateData(vals) {
    const data = { ...vals };

    if (this.env && this.env.userId) {
      data.created_by = this.env.userId;
      data.updated_by = this.env.userId;
    }

    data.created_at = new Date();
    data.updated_at = new Date();

    return data;
  }

  /**
   * Prépare les données pour la modification
   */
  async _prepareWriteData(vals) {
    const data = { ...vals };

    if (this.env && this.env.userId) {
      data.updated_by = this.env.userId;
    }

    data.updated_at = new Date();

    return data;
  }

  /**
   * Nettoie les données — à surcharger par les sous-classes
   */
  _sanitizeData(data) {
    return data;
  }

  /**
   * Convertit un enregistrement SQL en format standard — à surcharger
   */
  _toRecord(record) {
    return record;
  }
}

/**
 * RecordSet - Représente un ensemble d'enregistrements (lazy loading)
 */
class RecordSet {
  constructor(model, ids) {
    this.model = model;
    this.ids = ids;
    this._records = null;
  }

  async _load() {
    if (!this._records) {
      this._records = await this.model.read(this.ids);
    }
    return this._records;
  }

  async mapped(field) {
    const records = await this._load();
    return records.map(record => record[field]);
  }

  async filtered(callback) {
    const records = await this._load();
    return records.filter(callback);
  }
}

export default BaseModel;
