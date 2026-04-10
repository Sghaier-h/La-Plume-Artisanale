/**
 * Modèle Client - Gestion des clients
 * Utilise BaseModel pour les opérations ORM
 */

import { BaseModel } from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';
import { getTableName, getIdField, mapField, mapRecord, mapValues } from '../../../src/core/TableMapping.js';
import { loadRelations } from '../../../src/core/Relations.js';

export class Client extends BaseModel {
  constructor() {
    super('res.partner'); // Utilise res.partner pour le mapping
    this.tableName = getTableName('res.partner') || 'clients';
    this._tableName = this.tableName;
    this._idField = getIdField('res.partner') || 'id_client';
  }

  /**
   * Recherche des clients avec filtres avancés
   */
  async search(domain = [], options = {}) {
    const {
      limit = null,
      offset = 0,
      order = 'date_creation DESC',
      fields = null
    } = options;

    // Construire la clause WHERE depuis le domaine
    let whereClause = this._domainToSQL(domain);
    if (!whereClause) whereClause = '1=1';

    // Construire la requête SQL
    let query = `
      SELECT 
        c.*,
        cat.libelle as libelle_categorie,
        u.nom_utilisateur as nom_commercial,
        tc.libelle as libelle_type_commercial,
        (SELECT COUNT(*) FROM commandes WHERE id_client = c.id_client) as nb_commandes,
        (SELECT COUNT(*) FROM adresses_client WHERE id_client = c.id_client AND actif = true) as nb_adresses,
        (SELECT COUNT(*) FROM contacts_client WHERE id_client = c.id_client AND actif = true) as nb_contacts
      FROM clients c
      LEFT JOIN categories_clients cat ON c.id_categorie = cat.id_categorie
      LEFT JOIN utilisateurs u ON c.id_commercial = u.id_utilisateur
      LEFT JOIN types_commerciaux tc ON c.id_type_commercial = tc.id_type_commercial
      WHERE ${whereClause}
    `;

    if (order) {
      query += ` ORDER BY ${order}`;
    }

    if (limit) {
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const result = await pool.query(query);
    const records = result.rows.map(row => this._toRecord(row));
    
    // Charger les relations si demandé
    if (options.loadRelations) {
      return await Promise.all(records.map(record => 
        loadRelations('res.partner', record, options.loadRelations)
      ));
    }
    
    return records;
  }

  /**
   * Lit un client avec toutes ses relations
   */
  async read(ids, options = {}) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const query = `
      SELECT 
        c.*,
        cat.libelle as libelle_categorie,
        u.nom_utilisateur as nom_commercial,
        tc.libelle as libelle_type_commercial
      FROM clients c
      LEFT JOIN categories_clients cat ON c.id_categorie = cat.id_categorie
      LEFT JOIN utilisateurs u ON c.id_commercial = u.id_utilisateur
      LEFT JOIN types_commerciaux tc ON c.id_type_commercial = tc.id_type_commercial
      WHERE c.id_client = ANY($1)
    `;

    const result = await pool.query(query, [idArray]);
    return result.rows;
  }

  /**
   * Crée un client avec validation
   */
  async create(vals) {
    const valsList = Array.isArray(vals) ? vals : [vals];
    const results = [];

    for (const valsItem of valsList) {
      // Validation
      await this._validate(valsItem);

      // Déterminer le type de client automatiquement si non spécifié
      if (!valsItem.type_client) {
        valsItem.type_client = 'PROSPECT'; // Par défaut prospect
      }

      // Déterminer la devise par pays si non spécifiée
      if (!valsItem.devise && valsItem.pays) {
        valsItem.devise = this._determinerDevise(valsItem.pays);
      }

      // Préparer les données
      const data = await this._prepareCreateData(valsItem);

      // Insérer le client
      const fields = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const query = `
        INSERT INTO clients (${fields})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await pool.query(query, values);
      results.push(result.rows[0]);
    }

    return Array.isArray(vals) ? results : results[0];
  }

  /**
   * Met à jour un client
   */
  async write(ids, vals) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    // Validation
    await this._validate(vals, true);

    // Préparer les données
    const data = await this._prepareUpdateData(vals);

    // Mettre à jour
    const fields = Object.keys(data).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(data);

    for (const id of idArray) {
      const query = `
        UPDATE clients
        SET ${fields}, date_modification = NOW()
        WHERE id_client = $1
        RETURNING *
      `;

      await pool.query(query, [id, ...values]);
    }

    return await this.read(idArray);
  }

  /**
   * Supprime (désactive) un client
   */
  async unlink(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const query = `
      UPDATE clients
      SET actif = false, date_desactivation = NOW()
      WHERE id_client = ANY($1)
      RETURNING id_client
    `;

    const result = await pool.query(query, [idArray]);
    return result.rows;
  }

  /**
   * Méthodes métier spécifiques
   */

  /**
   * Détermine le type de client (PROSPECT ou CLIENT)
   */
  async determinerTypeClient(clientId) {
    const query = `
      SELECT COUNT(*) as nb_commandes
      FROM commandes
      WHERE id_client = $1
    `;

    const result = await pool.query(query, [clientId]);
    const nbCommandes = parseInt(result.rows[0].nb_commandes);

    if (nbCommandes > 0) {
      await this.write([clientId], { type_client: 'CLIENT' });
      return 'CLIENT';
    } else {
      await this.write([clientId], { type_client: 'PROSPECT' });
      return 'PROSPECT';
    }
  }

  /**
   * Récupère les statistiques d'un client
   */
  async getStats(clientId) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM commandes WHERE id_client = $1) as nb_commandes,
        (SELECT COUNT(*) FROM commandes WHERE id_client = $1 AND statut = 'LIVREE') as nb_commandes_livrees,
        (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures WHERE id_client = $1) as chiffre_affaires,
        (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures WHERE id_client = $1 AND statut = 'PAYEE') as montant_paye,
        (SELECT COUNT(*) FROM adresses_client WHERE id_client = $1 AND actif = true) as nb_adresses,
        (SELECT COUNT(*) FROM contacts_client WHERE id_client = $1 AND actif = true) as nb_contacts
    `;

    const result = await pool.query(query, [clientId]);
    return result.rows[0];
  }

  /**
   * Méthodes privées
   */

  _domainToSQL(domain) {
    if (!domain || domain.length === 0) return null;

    const conditions = [];
    let i = 0;

    while (i < domain.length) {
      const item = domain[i];

      if (Array.isArray(item)) {
        // Condition simple [field, operator, value]
        const [field, operator, value] = item;
        conditions.push(this._buildCondition(field, operator, value));
        i++;
      } else if (item === '&' || item === '|') {
        // Opérateur logique
        conditions.push(item === '&' ? 'AND' : 'OR');
        i++;
      } else if (item === '!') {
        // Négation
        conditions.push('NOT');
        i++;
      } else {
        i++;
      }
    }

    return conditions.length > 0 ? conditions.join(' ') : null;
  }

  _buildCondition(field, operator, value) {
    const fieldMap = {
      'id_client': 'c.id_client',
      'code_client': 'c.code_client',
      'raison_sociale': 'c.raison_sociale',
      'type_client': 'c.type_client',
      'id_categorie': 'c.id_categorie',
      'id_commercial': 'c.id_commercial',
      'actif': 'c.actif',
      'devise': 'c.devise'
    };

    const dbField = fieldMap[field] || `c.${field}`;

    switch (operator) {
      case '=':
        return `${dbField} = '${value}'`;
      case '!=':
      case '<>':
        return `${dbField} != '${value}'`;
      case '>':
        return `${dbField} > ${value}`;
      case '>=':
        return `${dbField} >= ${value}`;
      case '<':
        return `${dbField} < ${value}`;
      case '<=':
        return `${dbField} <= ${value}`;
      case 'like':
      case 'ilike':
        return `${dbField} ILIKE '%${value}%'`;
      case 'in':
        const values = Array.isArray(value) ? value.map(v => `'${v}'`).join(',') : `'${value}'`;
        return `${dbField} IN (${values})`;
      default:
        return `${dbField} = '${value}'`;
    }
  }

  _determinerDevise(pays) {
    const paysDevise = {
      'Tunisie': 'TND',
      'France': 'EUR',
      'Allemagne': 'EUR',
      'Italie': 'EUR',
      'Espagne': 'EUR',
      'Belgique': 'EUR',
      'Suisse': 'CHF'
    };

    return paysDevise[pays] || 'USD';
  }

  async _validate(vals, isUpdate = false) {
    // Validation code_client unique
    if (vals.code_client) {
      const query = `
        SELECT id_client FROM clients 
        WHERE code_client = $1 ${isUpdate ? 'AND id_client != $2' : ''}
      `;
      const params = isUpdate ? [vals.code_client, vals.id_client] : [vals.code_client];
      const result = await pool.query(query, params);
      
      if (result.rows.length > 0) {
        throw new Error('Le code client existe déjà');
      }
    }

    // Validation raison_sociale requise
    if (!isUpdate && !vals.raison_sociale) {
      throw new Error('La raison sociale est requise');
    }
  }

  async _prepareCreateData(vals) {
    return {
      code_client: vals.code_client,
      raison_sociale: vals.raison_sociale,
      type_client: vals.type_client || 'PROSPECT',
      id_categorie: vals.id_categorie || null,
      id_commercial: vals.id_commercial || null,
      id_type_commercial: vals.id_type_commercial || null,
      civilite: vals.civilite || null,
      siren_siret: vals.siren_siret || null,
      numero_tva: vals.numero_tva || null,
      site_web: vals.site_web || null,
      conditions_paiement: vals.conditions_paiement || null,
      plafond_credit: vals.plafond_credit || null,
      devise: vals.devise || 'TND',
      taux_remise: vals.taux_remise || 0,
      actif: vals.actif !== undefined ? vals.actif : true,
      date_creation: new Date()
    };
  }

  async _prepareUpdateData(vals) {
    const data = {};
    const allowedFields = [
      'code_client', 'raison_sociale', 'type_client', 'id_categorie',
      'id_commercial', 'id_type_commercial', 'civilite', 'siren_siret',
      'numero_tva', 'site_web', 'conditions_paiement', 'plafond_credit',
      'devise', 'taux_remise', 'actif', 'raison_desactivation'
    ];

    for (const field of allowedFields) {
      if (vals[field] !== undefined) {
        data[field] = vals[field];
      }
    }

    return data;
  }

  _mapField(field) {
    return mapField('res.partner', field);
  }

  _toRecord(row) {
    const mapped = mapRecord('res.partner', row);
    // Ajouter les champs calculés/joints
    if (row.libelle_categorie) mapped.libelle_categorie = row.libelle_categorie;
    if (row.nom_commercial) mapped.nom_commercial = row.nom_commercial;
    if (row.libelle_type_commercial) mapped.libelle_type_commercial = row.libelle_type_commercial;
    if (row.nb_commandes !== undefined) mapped.nb_commandes = row.nb_commandes;
    if (row.nb_adresses !== undefined) mapped.nb_adresses = row.nb_adresses;
    if (row.nb_contacts !== undefined) mapped.nb_contacts = row.nb_contacts;
    return mapped;
  }
}

export default Client;
