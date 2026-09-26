/**
 * Contrôleur Produits - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// ─── Attributs (référentiels) ───────────────────────────────────
// Map "kind" → table + columns for CRUD.
const ATTRIBUT_TABLES = {
  dimensions: {
    table: 'parametres_dimensions',
    columns: ['code', 'libelle', 'largeur', 'longueur', 'actif'],
  },
  couleurs: {
    table: 'parametres_couleurs',
    columns: ['code_commercial', 'nom', 'code_hex', 'actif'],
  },
  finitions: {
    table: 'parametres_finitions',
    columns: ['code', 'libelle', 'description', 'actif'],
  },
  tissages: {
    table: 'parametres_tissages',
    columns: ['code', 'libelle', 'description', 'actif'],
  },
  personnalisations: {
    table: 'parametres_personnalisations',
    columns: ['code', 'libelle', 'description', 'actif'],
  },
  nombres_couleurs: {
    table: 'parametres_nombre_couleurs',
    columns: ['code', 'libelle', 'nombre', 'actif'],
  },
};

// GET /api/produits/attributs
export const getAttributs = async (req, res) => {
  try {
    const runQuery = async (table) => {
      try {
        const r = await pool.query(
          `SELECT * FROM ${table} WHERE (actif IS NULL OR actif = true) ORDER BY id`
        );
        return r.rows;
      } catch (_) {
        try {
          const r = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
          return r.rows;
        } catch { return []; }
      }
    };

    const [dimensions, couleurs, finitions, tissages, personnalisations, nombres_couleurs] =
      await Promise.all([
        runQuery('parametres_dimensions'),
        runQuery('parametres_couleurs'),
        runQuery('parametres_finitions'),
        runQuery('parametres_tissages'),
        runQuery('parametres_personnalisations'),
        runQuery('parametres_nombre_couleurs'),
      ]);

    // types_produits: no dedicated lookup table exists — return empty.
    return sendSuccess(res, {
      dimensions,
      couleurs,
      finitions,
      tissages,
      personnalisations,
      nombres_couleurs,
      types_produits: [],
    }, 'Attributs récupérés');
  } catch (error) {
    return handleError(res, error, 'getAttributs');
  }
};

// Validate + pick kind either from body.kind or query.kind
const pickAttrKind = (req) => {
  const k = (req.body && req.body.kind) || req.query.kind;
  if (!k || !ATTRIBUT_TABLES[k]) return null;
  return k;
};

// POST /api/produits/attributs  body:{ kind, ...fields }
export const createAttribut = async (req, res) => {
  try {
    const kind = pickAttrKind(req);
    if (!kind) return sendError(res, 'kind requis (dimensions|couleurs|finitions|tissages|personnalisations|nombres_couleurs)', 400);
    const { table, columns } = ATTRIBUT_TABLES[kind];
    const data = req.body || {};
    const fields = columns.filter(c => data[c] !== undefined);
    if (!fields.length) return sendError(res, 'Aucune donnée à créer', 400);
    const values = fields.map(f => data[f]);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const q = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const r = await pool.query(q, values);
    return sendSuccess(res, r.rows[0], 'Attribut créé', 201);
  } catch (error) {
    return handleError(res, error, 'createAttribut');
  }
};

// PUT /api/produits/attributs/:id  body:{ kind, ...fields }
export const updateAttribut = async (req, res) => {
  try {
    const kind = pickAttrKind(req);
    if (!kind) return sendError(res, 'kind requis (dimensions|couleurs|finitions|tissages|personnalisations|nombres_couleurs)', 400);
    const { table, columns } = ATTRIBUT_TABLES[kind];
    const data = req.body || {};
    const fields = columns.filter(c => data[c] !== undefined);
    if (!fields.length) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const q = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
    const r = await pool.query(q, [...values, req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Attribut introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Attribut mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateAttribut');
  }
};

// DELETE /api/produits/attributs/:id?kind=...
export const deleteAttribut = async (req, res) => {
  try {
    const kind = pickAttrKind(req);
    if (!kind) return sendError(res, 'kind requis (query ?kind=...)', 400);
    const { table } = ATTRIBUT_TABLES[kind];
    // Soft delete when actif column exists
    let r;
    try {
      r = await pool.query(`UPDATE ${table} SET actif = false WHERE id = $1 RETURNING id`, [req.params.id]);
    } catch {
      r = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [req.params.id]);
    }
    if (!r.rows[0]) return sendError(res, 'Attribut introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id }, 'Attribut supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteAttribut');
  }
};

// GET /api/produits - Liste tous les enregistrements
export const getProduits = async (req, res) => {
  try {
    const query = `SELECT * FROM produits ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Produits récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getProduits');
  }
};

// GET /api/produits/:id - Récupère un enregistrement
export const getProduitsById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM produits WHERE id_produits = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Produits non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Produits récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getProduitsById');
  }
};

// POST /api/produits - Crée un enregistrement
// POST /api/produits - Crée un enregistrement
export const createProduits = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_produits', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO produits (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createProduits');
  }
};

// PUT /api/produits/:id - Met à jour un enregistrement
// PUT /api/produits/:id - Met à jour un enregistrement
export const updateProduits = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_produits', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE produits SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_produits = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateProduits');
  }
};

// DELETE /api/produits/:id - Supprime un enregistrement
// DELETE /api/produits/:id - Supprime un enregistrement
export const deleteProduits = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'produits' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE produits SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_produits = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM produits WHERE id_produits = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM produits WHERE id_produits = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteProduits');
  }
};
