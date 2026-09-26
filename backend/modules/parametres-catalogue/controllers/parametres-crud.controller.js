/**
 * Contrôleur Paramètres Catalogue — CRUD complet
 * Tables : parametres_dimensions, parametres_couleurs, parametres_finitions,
 *          parametres_tissages, parametres_modeles, parametres_nombre_couleurs
 *
 * Porté depuis la logique GAS 04_Catalogue.gs (getParametrageComplet, ajouterParametre, ...)
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// ─────────────────────────────────────────────────────────────────────
// Configuration des tables de paramétrage
// ─────────────────────────────────────────────────────────────────────
const PARAM_TABLES = {
  dimensions: {
    table: 'parametres_dimensions',
    fields: ['code', 'libelle', 'largeur', 'longueur', 'actif'],
    required: ['code', 'libelle'],
    orderBy: 'libelle'
  },
  couleurs: {
    table: 'parametres_couleurs',
    fields: ['code_commercial', 'nom', 'code_hex', 'actif'],
    required: ['nom'],
    orderBy: 'nom'
  },
  finitions: {
    table: 'parametres_finitions',
    fields: ['code', 'libelle', 'description', 'actif'],
    required: ['code', 'libelle'],
    orderBy: 'libelle'
  },
  tissages: {
    table: 'parametres_tissages',
    fields: ['code', 'libelle', 'description', 'actif'],
    required: ['code', 'libelle'],
    orderBy: 'libelle'
  },
  modeles: {
    table: 'parametres_modeles',
    fields: ['code_modele', 'libelle', 'description', 'id_type_produit', 'id_tissage', 'photo_url', 'actif'],
    required: ['code_modele', 'libelle'],
    orderBy: 'libelle'
  },
  'nombre-couleurs': {
    table: 'parametres_nombre_couleurs',
    fields: ['code', 'libelle', 'nombre', 'actif'],
    required: ['code', 'libelle', 'nombre'],
    orderBy: 'nombre'
  }
};

/**
 * Récupère la config pour un type de paramètre
 */
function getConfig(type) {
  const cfg = PARAM_TABLES[type];
  if (!cfg) throw new Error(`Type de paramètre inconnu : ${type}`);
  return cfg;
}

// ─────────────────────────────────────────────────────────────────────
// GET /api/parametres-catalogue/complet
// Charge TOUS les paramètres en une seule requête (comme getParametrageComplet du GAS)
// ─────────────────────────────────────────────────────────────────────
export const getParametrageComplet = async (req, res) => {
  try {
    const results = await Promise.all(
      Object.entries(PARAM_TABLES).map(async ([key, cfg]) => {
        const r = await pool.query(
          `SELECT * FROM ${cfg.table} WHERE actif = true ORDER BY ${cfg.orderBy}`
        );
        return [key, r.rows];
      })
    );

    const data = Object.fromEntries(results);
    return sendSuccess(res, data);
  } catch (error) {
    return handleError(res, error, 'getParametrageComplet');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/parametres-catalogue/:type
// Liste les entrées d'un type (dimensions, couleurs, etc.)
// ─────────────────────────────────────────────────────────────────────
export const getParametresType = async (req, res) => {
  try {
    const { type } = req.params;
    const cfg = getConfig(type);
    const { actif } = req.query;

    let query = `SELECT * FROM ${cfg.table}`;
    const params = [];
    if (actif !== undefined) {
      query += ' WHERE actif = $1';
      params.push(actif === 'true');
    }
    query += ` ORDER BY ${cfg.orderBy}`;

    const result = await pool.query(query, params);
    return sendSuccess(res, result.rows);
  } catch (error) {
    return handleError(res, error, 'getParametresType');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/parametres-catalogue/:type/:id
// ─────────────────────────────────────────────────────────────────────
export const getParametreById = async (req, res) => {
  try {
    const { type, id } = req.params;
    const cfg = getConfig(type);

    // Les tables paramètres utilisent toutes la PK "id"
    const result = await pool.query(`SELECT * FROM ${cfg.table} WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND(type));
    }
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getParametreById');
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/parametres-catalogue/:type
// ─────────────────────────────────────────────────────────────────────
export const createParametre = async (req, res) => {
  try {
    const { type } = req.params;
    const cfg = getConfig(type);
    const data = req.body;

    // Validation champs requis
    for (const field of cfg.required) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD(field));
      }
    }

    // Préparer les valeurs pour INSERT (seuls les champs autorisés)
    const fields = cfg.fields.filter(f => data[f] !== undefined);
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à insérer', HTTP_STATUS.BAD_REQUEST);
    }

    const values = fields.map(f => data[f]);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${cfg.table} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await pool.query(query, values);
    logger.info(`Paramètre ${type} créé`, { id: result.rows[0].id });
    return sendSuccess(res, result.rows[0], 'Paramètre créé avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'createParametre');
  }
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/parametres-catalogue/:type/:id
// ─────────────────────────────────────────────────────────────────────
export const updateParametre = async (req, res) => {
  try {
    const { type, id } = req.params;
    const cfg = getConfig(type);
    const data = req.body;

    // Champs autorisés uniquement
    const fieldsToUpdate = cfg.fields.filter(f => data[f] !== undefined);
    if (fieldsToUpdate.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', HTTP_STATUS.BAD_REQUEST);
    }

    const values = fieldsToUpdate.map(f => data[f]);
    const setClause = fieldsToUpdate.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const query = `
      UPDATE ${cfg.table}
      SET ${setClause}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);
    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND(type));
    }

    logger.info(`Paramètre ${type} mis à jour`, { id });
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateParametre');
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/parametres-catalogue/:type/:id (soft delete via actif=false)
// ─────────────────────────────────────────────────────────────────────
export const deleteParametre = async (req, res) => {
  try {
    const { type, id } = req.params;
    const cfg = getConfig(type);

    const result = await pool.query(
      `UPDATE ${cfg.table} SET actif = false WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND(type));
    }

    logger.info(`Paramètre ${type} désactivé`, { id });
    return sendSuccess(res, { message: 'Paramètre désactivé avec succès' });
  } catch (error) {
    return handleError(res, error, 'deleteParametre');
  }
};
