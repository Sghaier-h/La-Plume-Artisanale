/**
 * AccountMove Model - Écriture comptable (Facture)
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class AccountMove extends BaseModel {
  constructor() {
    super('account.move', null);
    this._name = 'account.move';
    this._description = 'Account Move (Invoice)';
  }

  async search(domain = [], options = {}) {
    // Déterminer le type de facture depuis le domaine
    let moveType = null;
    for (let i = 0; i < domain.length; i++) {
      const item = domain[i];
      if (Array.isArray(item) && item.length === 3 && item[0] === 'move_type') {
        moveType = item[2];
        break;
      }
    }

    // Choisir la table selon le type
    const tableName = moveType === 'in_invoice' ? 'factures_fournisseurs' : 'factures_clients';
    const partnerTable = moveType === 'in_invoice' ? 'fournisseurs' : 'clients';
    const partnerIdField = moveType === 'in_invoice' ? 'id_fournisseur' : 'id_client';
    const partnerJoinField = moveType === 'in_invoice' ? 'id_fournisseur' : 'id_client';

    let query = `
      SELECT 
        f.*,
        p.raison_sociale as partner_name
      FROM ${tableName} f
      LEFT JOIN ${partnerTable} p ON f.${partnerJoinField} = p.${partnerIdField}
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    for (let i = 0; i < domain.length; i++) {
      const item = domain[i];
      if (Array.isArray(item) && item.length === 3) {
        const [field, operator, value] = item;
        
        // Ignorer move_type car déjà utilisé pour choisir la table
        if (field === 'move_type') {
          continue;
        }
        
        paramCount++;
        const sqlField = this._mapField(field, moveType);
        
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
      query += ` ORDER BY f.date_facture DESC`;
    } else {
      query += ` ORDER BY f.date_facture DESC`;
    }
    if (options.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(options.limit);
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => this._toRecord(row, moveType));
  }

  async read(ids, options = {}) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    // Pour read, on doit déterminer la table depuis les données existantes
    // On essaie d'abord factures_clients, puis factures_fournisseurs
    let query = `
      SELECT 
        f.*,
        c.raison_sociale as partner_name
      FROM factures_clients f
      LEFT JOIN clients c ON f.id_client = c.id_client
      WHERE f.id_facture = ANY($1)
    `;
    
    let result = await pool.query(query, [idArray]);
    
    // Si pas trouvé, chercher dans factures_fournisseurs
    if (result.rows.length === 0) {
      query = `
        SELECT 
          f.*,
          fr.raison_sociale as partner_name
        FROM factures_fournisseurs f
        LEFT JOIN fournisseurs fr ON f.id_fournisseur = fr.id_fournisseur
        WHERE f.id_facture = ANY($1)
      `;
      result = await pool.query(query, [idArray]);
      return result.rows.map(row => this._toRecord(row, 'in_invoice'));
    }
    
    return result.rows.map(row => this._toRecord(row, 'out_invoice'));
  }

  async write(ids, vals) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    // Déterminer la table depuis les données existantes
    const records = await this.read(idArray);
    if (records.length === 0) {
      throw new Error('Records not found');
    }
    
    const moveType = records[0]?.move_type || 'out_invoice';
    const tableName = moveType === 'in_invoice' ? 'factures_fournisseurs' : 'factures_clients';
    
    // Construire la requête UPDATE
    const setClauses = [];
    const params = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(vals)) {
      const sqlField = this._mapField(key, moveType);
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
    
    const query = `
      UPDATE ${tableName} 
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id_facture = ANY($${paramCount})
    `;

    const result = await pool.query(query, params);
    return result;
  }

  async action_post(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    // Déterminer la table depuis les données
    const records = await this.read(idArray);
    if (records.length === 0) {
      throw new Error('Records not found');
    }
    const moveType = records[0]?.move_type || 'out_invoice';
    const tableName = moveType === 'in_invoice' ? 'factures_fournisseurs' : 'factures_clients';
    
    await pool.query(
      `UPDATE ${tableName} SET statut = $1, updated_at = NOW() WHERE id_facture = ANY($2)`,
      ['EMISE', idArray]
    );
    return true;
  }

  async action_draft(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    // Déterminer la table depuis les données
    const records = await this.read(idArray);
    if (records.length === 0) {
      throw new Error('Records not found');
    }
    const moveType = records[0]?.move_type || 'out_invoice';
    const tableName = moveType === 'in_invoice' ? 'factures_fournisseurs' : 'factures_clients';
    
    await pool.query(
      `UPDATE ${tableName} SET statut = $1, updated_at = NOW() WHERE id_facture = ANY($2)`,
      ['BROUILLON', idArray]
    );
    return true;
  }

  _mapField(field, moveType = null) {
    const partnerField = moveType === 'in_invoice' ? 'id_fournisseur' : 'id_client';
    
    const mapping = {
      'name': 'numero_facture',
      'partner_id': partnerField,
      'move_type': 'type_facture',
      'state': 'statut',
      'invoice_date': 'date_facture',
      'amount_total': 'montant_ttc',
      'amount_untaxed': 'montant_ht',
      'amount_tax': 'montant_tva'
    };
    return mapping[field] || field;
  }

  _toRecord(row, moveType = null) {
    const partnerIdField = moveType === 'in_invoice' ? 'id_fournisseur' : 'id_client';
    
    return {
      id: row.id_facture,
      name: row.numero_facture,
      partner_id: row[partnerIdField],
      partner_name: row.partner_name,
      move_type: moveType || 'out_invoice',
      state: row.statut || 'BROUILLON',
      invoice_date: row.date_facture,
      amount_total: parseFloat(row.montant_ttc || 0),
      amount_untaxed: parseFloat(row.montant_ht || 0),
      amount_tax: parseFloat(row.montant_tva || 0)
    };
  }
}

export default AccountMove;
