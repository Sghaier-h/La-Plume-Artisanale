/**
 * SaleOrder Model - Modèle de commande de vente
 * Système ERP La Plume Artisanale
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';
import { getTableName, getIdField, mapField, mapRecord, mapValues } from '../../../src/core/TableMapping.js';
import { loadRelations } from '../../../src/core/Relations.js';

const SALE_ORDER_STATES = [
  ['draft', 'Quotation'],
  ['sent', 'Quotation Sent'],
  ['sale', 'Sales Order'],
  ['cancel', 'Cancelled']
];

export class SaleOrder extends BaseModel {
  constructor() {
    super('sale.order', null); // Utilise SQL direct
    this._name = 'sale.order';
    this._description = 'Sales Order';
    this._order = 'date_order desc, id desc';
    this._tableName = getTableName('sale.order');
    this._idField = getIdField('sale.order');
  }

  async search(domain = [], options = {}) {
    const tableName = this._tableName || 'commandes_clients';
    let query = `
      SELECT 
        c.*,
        cl.raison_sociale as partner_name
      FROM ${tableName} c
      LEFT JOIN clients cl ON c.id_client = cl.id_client
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

    if (options.order) {
      query += ` ORDER BY c.date_commande DESC`;
    } else {
      query += ` ORDER BY c.date_commande DESC`;
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
        loadRelations('sale.order', record, options.loadRelations)
      ));
    }
    
    return records;
  }

  async read(ids, options = {}) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const tableName = this._tableName || 'commandes_clients';
    const idField = this._idField || 'id_commande';
    
    const query = `
      SELECT 
        c.*,
        cl.raison_sociale as partner_name
      FROM ${tableName} c
      LEFT JOIN clients cl ON c.id_client = cl.id_client
      WHERE c.${idField} = ANY($1)
    `;
    
    const result = await pool.query(query, [idArray]);
    const records = result.rows.map(row => this._toRecord(row));
    
    // Charger les relations si demandé
    if (options.loadRelations) {
      return await Promise.all(records.map(record => 
        loadRelations('sale.order', record, options.loadRelations)
      ));
    }
    
    return records;
  }

  async write(ids, vals) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    // Préparer les données
    const data = await this._prepareWriteData(vals);
    const sanitized = this._sanitizeData(data);

    // Construire la requête UPDATE
    const setClauses = [];
    const params = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(sanitized)) {
      const sqlField = this._mapField(key);
      if (sqlField && value !== undefined) {
        paramCount++;
        setClauses.push(`${sqlField} = $${paramCount}`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) {
      return { rowCount: 0 };
    }

    paramCount++;
    params.push(idArray);
    
    const tableName = this._tableName || 'commandes_clients';
    const idField = this._idField || 'id_commande';
    const query = `
      UPDATE ${tableName} 
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE ${idField} = ANY($${paramCount})
    `;

    const result = await pool.query(query, params);
    return result;
  }

  async unlink(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const tableName = this._tableName || 'commandes_clients';
    const idField = this._idField || 'id_commande';
    
    const query = `DELETE FROM ${tableName} WHERE ${idField} = ANY($1)`;
    const result = await pool.query(query, [idArray]);

    return result;
  }

  _mapField(field) {
    return mapField('sale.order', field);
  }

  /**
   * Crée une commande avec séquence automatique
   */
  async create(vals) {
    const valsList = Array.isArray(vals) ? vals : [vals];
    const results = [];

    for (const valsItem of valsList) {
      // Générer le numéro de commande si nécessaire
      if (!valsItem.name || valsItem.name === 'New') {
        valsItem.name = await this._generateSequence();
      }

      // Appliquer les valeurs par défaut
      const data = await this._prepareCreateData(valsItem);
      
      // Créer l'enregistrement via SQL
      const tableName = this._tableName || 'commandes_clients';
      const sqlValues = mapValues('sale.order', data);
      const insertQuery = `
        INSERT INTO ${tableName} (
          numero_commande, id_client, date_commande, statut, montant_ttc,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;
      const insertParams = [
        sqlValues.numero_commande || data.name,
        sqlValues.id_client || data.partner_id,
        sqlValues.date_commande || data.date_order || new Date(),
        sqlValues.statut || data.state || 'EN_ATTENTE',
        sqlValues.montant_ttc || data.amount_total || 0,
        this.env?.userId || null
      ];
      
      const insertResult = await pool.query(insertQuery, insertParams);
      const record = insertResult.rows[0];

      results.push(this._toRecord(record));
    }

    return Array.isArray(vals) ? results : results[0];
  }

  /**
   * Génère un numéro de séquence
   */
  async _generateSequence() {
    // TODO: Implémenter avec ir.sequence
    try {
      const tableName = this._tableName || 'commandes_clients';
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = parseInt(result.rows[0]?.count || 0);
      return `SO${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      // Si la table n'existe pas, retourner un numéro par défaut
      return `SO000001`;
    }
  }

  /**
   * Calcule le montant total
   * @depends('order_line.price_total')
   */
  async _compute_amount_total(records) {
    for (const record of records) {
      const lines = record.order_line || [];
      record.amount_total = lines.reduce((sum, line) => {
        return sum + (line.price_total || 0);
      }, 0);
    }
  }

  /**
   * Valide la commande avant confirmation
   * @constrains('state', 'order_line')
   */
  async _check_confirm(records) {
    for (const record of records) {
      if (record.state === 'sale' && (!record.order_line || record.order_line.length === 0)) {
        throw new Error('Cannot confirm order without lines');
      }
    }
  }

  /**
   * Confirme la commande (draft → sale)
   */
  async action_confirm(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    // Vérifier que toutes les commandes sont en draft
    const orders = await this.read(idArray);
    for (const order of orders) {
      if (order.state !== 'draft' && order.state !== 'sent') {
        throw new Error('Only draft or sent orders can be confirmed');
      }
    }

    // Mettre à jour l'état
    await this.write(idArray, {
      state: 'sale',
      date_order: new Date()
    });

    return true;
  }

  /**
   * Annule la commande
   */
  async action_cancel(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    // Vérifier que la commande n'est pas déjà terminée
    const orders = await this.read(idArray);
    for (const order of orders) {
      if (order.state === 'done') {
        throw new Error('Cannot cancel a done order');
      }
    }

    // Mettre à jour l'état
    await this.write(idArray, { state: 'cancel' });

    return true;
  }

  /**
   * Prépare les données pour la création
   */
  async _prepareCreateData(vals) {
    const data = { ...vals };

    // Valeurs par défaut
    if (!data.state) {
      data.state = 'draft';
    }
    if (!data.date_order) {
      data.date_order = new Date();
    }

    // Préparer les lignes de commande
    if (data.order_line && Array.isArray(data.order_line)) {
      data.order_line = {
        create: data.order_line.map(line => ({
          product_id: line.product_id,
          quantity: line.quantity || 1,
          price_unit: line.price_unit || 0,
          discount: line.discount || 0
        }))
      };
    }

    return await super._prepareCreateData(data);
  }

  /**
   * Nettoie les données
   */
  _sanitizeData(data) {
    // Enlever les champs non définis dans le schéma Prisma
    const allowedFields = [
      'name', 'partner_id', 'state', 'date_order', 'amount_total',
      'amount_untaxed', 'amount_tax', 'currency_id', 'company_id',
      'user_id', 'team_id', 'order_line', 'created_by', 'updated_by'
    ];

    const sanitized = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        sanitized[field] = data[field];
      }
    }

    return sanitized;
  }

  /**
   * Convertit un enregistrement SQL en format standard
   */
  _toRecord(row) {
    const mapped = mapRecord('sale.order', row);
    // Ajouter les champs calculés ou joints
    if (row.partner_name) {
      mapped.partner_name = row.partner_name;
    }
    if (!mapped.order_line) {
      mapped.order_line = [];
    }
    if (!mapped.currency_id) {
      mapped.currency_id = 'TND';
    }
    return mapped;
  }
}

export default SaleOrder;
