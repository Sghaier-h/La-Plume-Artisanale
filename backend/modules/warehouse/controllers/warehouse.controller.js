/**
 * Contrôleur Warehouse - Module modulaire
 *
 * Endpoints étendus (Fix 6) :
 *   GET  /api/warehouse/locations              — Liste emplacements
 *   GET  /api/warehouse/locations/tree         — Arborescence
 *   POST /api/warehouse/locations              — Créer emplacement
 *   GET  /api/warehouse/quants                 — Quantités par emplacement
 *   GET  /api/warehouse/products/:id/stock     — Stock d'un article
 *   GET  /api/warehouse/moves                  — Mouvements de stock
 *   GET  /api/warehouse/picking-types          — Types d'opération
 *   POST /api/warehouse/picking-types          — Créer type d'opération
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// Lazy import de io pour éviter les cycles au chargement du module
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};

// Cache des tables existantes pour éviter les requêtes répétées
const _tableCache = new Map();
const tableExists = async (name) => {
  if (_tableCache.has(name)) return _tableCache.get(name);
  try {
    const r = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
      [name]
    );
    const exists = r.rows.length > 0;
    _tableCache.set(name, exists);
    return exists;
  } catch {
    return false;
  }
};

// Retourne la première table existante parmi les candidates
const pickTable = async (candidates) => {
  for (const t of candidates) {
    if (await tableExists(t)) return t;
  }
  return null;
};

const columnExists = async (table, column) => {
  try {
    const r = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2 LIMIT 1`,
      [table, column]
    );
    return r.rows.length > 0;
  } catch {
    return false;
  }
};

// GET /api/warehouse - Liste tous les enregistrements
export const getWarehouse = async (req, res) => {
  try {
    const query = `SELECT * FROM warehouse ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Warehouse récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getWarehouse');
  }
};

// GET /api/warehouse/:id - Récupère un enregistrement
export const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM warehouse WHERE id_warehouse = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Warehouse non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Warehouse récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getWarehouseById');
  }
};

// POST /api/warehouse - Crée un enregistrement
// POST /api/warehouse - Crée un enregistrement
export const createWarehouse = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_warehouse', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO warehouse (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createWarehouse');
  }
};

// PUT /api/warehouse/:id - Met à jour un enregistrement
// PUT /api/warehouse/:id - Met à jour un enregistrement
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_warehouse', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE warehouse SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_warehouse = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateWarehouse');
  }
};

// DELETE /api/warehouse/:id - Supprime un enregistrement
// DELETE /api/warehouse/:id - Supprime un enregistrement
export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'warehouse' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE warehouse SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_warehouse = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM warehouse WHERE id_warehouse = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM warehouse WHERE id_warehouse = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteWarehouse');
  }
};

// ─────────────────────────────────────────────────────────────────
// Extensions Fix 6 — endpoints appelés par warehouseService (frontend)
// ─────────────────────────────────────────────────────────────────

// Table candidates (par ordre de préférence)
const LOCATION_TABLES = ['stock_location', 'emplacements', 'emplacements_stock'];
const QUANT_TABLES    = ['stock_quant', 'quants_stock', 'stock_reel'];
const MOVE_TABLES     = ['mouvements_stock', 'stock_move'];
const PT_TABLES       = ['stock_picking_type', 'picking_types'];

// ─── GET /api/warehouse/locations ────────────────────────────────
export const getLocations = async (req, res) => {
  try {
    const table = await pickTable(LOCATION_TABLES);
    if (!table) return sendSuccess(res, { items: [], total: 0, note: 'Table not available' });

    const { id_entrepot, type, search } = req.query;
    const params = [];
    const where = [];

    // Mapping colonnes selon la table trouvée
    let whCol = null, typeCol = null, nameCols = [];
    if (table === 'stock_location') {
      whCol = 'warehouse_id';
      typeCol = 'usage';
      nameCols = ['name', 'complete_name', 'barcode'];
    } else if (table === 'emplacements' || table === 'emplacements_stock') {
      whCol = 'id_entrepot';
      typeCol = (await columnExists(table, 'type_emplacement')) ? 'type_emplacement' : (await columnExists(table, 'type') ? 'type' : null);
      nameCols = ['code_emplacement', 'libelle', 'nom', 'code'].filter(Boolean);
    }

    if (id_entrepot && whCol) {
      params.push(parseInt(id_entrepot, 10));
      where.push(`${whCol} = $${params.length}`);
    }
    if (type && typeCol) {
      params.push(type);
      where.push(`${typeCol} = $${params.length}`);
    }
    if (search && nameCols.length) {
      params.push(`%${search}%`);
      const p = params.length;
      // Ne filtrer que sur les colonnes réellement présentes
      const existing = [];
      for (const c of nameCols) {
        if (await columnExists(table, c)) existing.push(c);
      }
      if (existing.length) {
        where.push('(' + existing.map((c) => `${c}::text ILIKE $${p}`).join(' OR ') + ')');
      }
    }

    const sql = `SELECT * FROM ${table} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} LIMIT 500`;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getLocations');
  }
};

// ─── GET /api/warehouse/locations/tree ───────────────────────────
export const getLocationsTree = async (req, res) => {
  try {
    const table = await pickTable(LOCATION_TABLES);
    if (!table) return sendSuccess(res, { items: [], total: 0, note: 'Table not available' });

    const r = await pool.query(`SELECT * FROM ${table} LIMIT 2000`);
    const rows = r.rows;

    // Détermine la clé de parent et l'identifiant
    let idKey, parentKey, whKey;
    if (table === 'stock_location') {
      idKey = 'id_location';
      parentKey = 'location_id';
      whKey = 'warehouse_id';
    } else {
      idKey = rows[0] ? (rows[0].id_emplacement !== undefined ? 'id_emplacement' : Object.keys(rows[0])[0]) : 'id';
      parentKey = (await columnExists(table, 'parent_id')) ? 'parent_id' : null;
      whKey = (await columnExists(table, 'id_entrepot')) ? 'id_entrepot' : null;
    }

    // Si parent hiérarchique disponible → arbre
    if (parentKey) {
      const byId = new Map();
      rows.forEach((row) => byId.set(row[idKey], { ...row, children: [] }));
      const roots = [];
      byId.forEach((node) => {
        const pid = node[parentKey];
        if (pid && byId.has(pid)) byId.get(pid).children.push(node);
        else roots.push(node);
      });
      return sendSuccess(res, { items: roots, total: rows.length });
    }

    // Sinon : plat, groupé par entrepôt
    const groups = new Map();
    rows.forEach((row) => {
      const key = whKey ? row[whKey] : 'default';
      if (!groups.has(key)) groups.set(key, { id_entrepot: key, children: [] });
      groups.get(key).children.push(row);
    });
    return sendSuccess(res, { items: Array.from(groups.values()), total: rows.length });
  } catch (error) {
    return handleError(res, error, 'getLocationsTree');
  }
};

// ─── POST /api/warehouse/locations ───────────────────────────────
export const createLocation = async (req, res) => {
  try {
    const table = await pickTable(LOCATION_TABLES);
    if (!table) return sendError(res, 'Table emplacements non disponible', 503);

    const userId = getUserId(req) || 1;
    const { nom, code, type, id_entrepot, parent_id, libelle } = req.body || {};

    const fields = [];
    const values = [];
    const push = (col, val) => { if (val !== undefined && val !== null) { fields.push(col); values.push(val); } };

    if (table === 'stock_location') {
      push('name', nom || libelle || code);
      push('usage', type || 'internal');
      push('warehouse_id', id_entrepot);
      push('location_id', parent_id);
    } else {
      // emplacements / emplacements_stock
      if (await columnExists(table, 'code_emplacement')) push('code_emplacement', code || nom);
      else if (await columnExists(table, 'code')) push('code', code || nom);
      if (await columnExists(table, 'libelle')) push('libelle', libelle || nom);
      else if (await columnExists(table, 'nom')) push('nom', nom || libelle);
      if (type) {
        if (await columnExists(table, 'type_emplacement')) push('type_emplacement', type);
        else if (await columnExists(table, 'type')) push('type', type);
      }
      if (await columnExists(table, 'id_entrepot')) push('id_entrepot', id_entrepot);
      if (parent_id && await columnExists(table, 'parent_id')) push('parent_id', parent_id);
    }

    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);

    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const r = await pool.query(sql, values);

    // Socket.IO
    try {
      const io = await getIo();
      if (io) io.emit('warehouse:location:created', r.rows[0]);
    } catch {}

    return sendSuccess(res, r.rows[0], 'Emplacement créé', 201);
  } catch (error) {
    return handleError(res, error, 'createLocation');
  }
};

// ─── GET /api/warehouse/quants ───────────────────────────────────
export const getQuants = async (req, res) => {
  try {
    const table = await pickTable(QUANT_TABLES);
    if (!table) return sendSuccess(res, { items: [], total: 0, note: 'Table not available' });

    const { id_article, id_emplacement, stock_min } = req.query;
    const params = [];
    const where = [];
    let selectSql;

    if (table === 'stock_quant') {
      if (id_article) { params.push(parseInt(id_article, 10)); where.push(`q.product_id = $${params.length}`); }
      if (id_emplacement) { params.push(parseInt(id_emplacement, 10)); where.push(`q.location_id = $${params.length}`); }
      if (stock_min !== undefined) { params.push(parseFloat(stock_min)); where.push(`q.quantity <= $${params.length}`); }
      selectSql = `
        SELECT q.*, p.designation AS article_designation, p.reference AS article_reference,
               l.name AS emplacement_nom
        FROM stock_quant q
        LEFT JOIN produits p ON q.product_id = p.id_produit
        LEFT JOIN stock_location l ON q.location_id = l.id_location
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY q.id_quant DESC
        LIMIT 500
      `;
    } else if (table === 'stock_reel') {
      if (id_article) { params.push(parseInt(id_article, 10)); where.push(`s.id_article = $${params.length}`); }
      if (id_emplacement) { params.push(parseInt(id_emplacement, 10)); where.push(`s.id_entrepot = $${params.length}`); }
      if (stock_min !== undefined) { params.push(parseFloat(stock_min)); where.push(`s.quantite_disponible <= $${params.length}`); }
      selectSql = `
        SELECT s.*, a.designation AS article_designation, a.reference AS article_reference
        FROM stock_reel s
        LEFT JOIN articles_catalogue a ON s.id_article = a.id_article
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY s.id_stock DESC
        LIMIT 500
      `;
    } else {
      // quants_stock générique
      selectSql = `SELECT * FROM ${table} LIMIT 500`;
    }

    const r = await pool.query(selectSql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getQuants');
  }
};

// ─── GET /api/warehouse/products/:id/stock ───────────────────────
export const getProductStock = async (req, res) => {
  try {
    const idArticle = parseInt(req.params.id, 10);
    if (!idArticle) return sendError(res, 'Article invalide', 400);

    const table = await pickTable(QUANT_TABLES);
    if (!table) return sendSuccess(res, { items: [], total: 0, stock_actuel: 0, stock_minimum: 0, note: 'Table not available' });

    let sql, params = [idArticle];
    if (table === 'stock_quant') {
      sql = `
        SELECT q.location_id AS id_emplacement,
               COALESCE(l.name, l.complete_name) AS emplacement_nom,
               SUM(q.quantity)::numeric AS quantite,
               SUM(q.reserved_quantity)::numeric AS quantite_reservee
        FROM stock_quant q
        LEFT JOIN stock_location l ON q.location_id = l.id_location
        WHERE q.product_id = $1
        GROUP BY q.location_id, l.name, l.complete_name
        ORDER BY q.location_id
      `;
    } else if (table === 'stock_reel') {
      sql = `
        SELECT s.id_entrepot AS id_emplacement,
               e.libelle AS emplacement_nom,
               SUM(s.quantite_disponible)::numeric AS quantite,
               SUM(s.quantite_reservee)::numeric AS quantite_reservee,
               MAX(s.stock_minimum)::numeric AS stock_minimum
        FROM stock_reel s
        LEFT JOIN entrepots e ON s.id_entrepot = e.id_entrepot
        WHERE s.id_article = $1
        GROUP BY s.id_entrepot, e.libelle
        ORDER BY s.id_entrepot
      `;
    } else {
      return sendSuccess(res, { items: [], total: 0, stock_actuel: 0, stock_minimum: 0 });
    }

    const r = await pool.query(sql, params);
    const stock_actuel = r.rows.reduce((s, row) => s + parseFloat(row.quantite || 0), 0);
    const stock_minimum = r.rows.reduce((s, row) => s + parseFloat(row.stock_minimum || 0), 0);
    return sendSuccess(res, {
      items: r.rows,
      total: r.rows.length,
      stock_actuel,
      stock_minimum,
      id_article: idArticle,
    });
  } catch (error) {
    return handleError(res, error, 'getProductStock');
  }
};

// ─── GET /api/warehouse/moves ────────────────────────────────────
export const getMoves = async (req, res) => {
  try {
    const table = await pickTable(MOVE_TABLES);
    if (!table) return sendSuccess(res, { items: [], total: 0, note: 'Table not available' });

    const { id_article, type_mouvement, id_entrepot, date_debut, date_fin, limit = 200 } = req.query;
    const params = [];
    const where = [];
    let sql;

    if (table === 'mouvements_stock') {
      if (id_article) { params.push(parseInt(id_article, 10)); where.push(`m.id_article = $${params.length}`); }
      if (type_mouvement) { params.push(type_mouvement); where.push(`m.type_mouvement = $${params.length}`); }
      if (id_entrepot) {
        params.push(parseInt(id_entrepot, 10));
        where.push(`(m.id_entrepot_origine = $${params.length} OR m.id_entrepot_destination = $${params.length})`);
      }
      if (date_debut) { params.push(date_debut); where.push(`m.date_mouvement >= $${params.length}`); }
      if (date_fin) { params.push(date_fin); where.push(`m.date_mouvement <= $${params.length}`); }
      params.push(parseInt(limit, 10) || 200);
      sql = `
        SELECT m.*, a.designation AS article_designation, a.reference AS article_reference
        FROM mouvements_stock m
        LEFT JOIN articles_catalogue a ON m.id_article = a.id_article
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY m.date_mouvement DESC
        LIMIT $${params.length}
      `;
    } else {
      // stock_move
      if (id_article) { params.push(parseInt(id_article, 10)); where.push(`m.product_id = $${params.length}`); }
      if (id_entrepot) {
        params.push(parseInt(id_entrepot, 10));
        where.push(`(m.location_id = $${params.length} OR m.location_dest_id = $${params.length})`);
      }
      if (date_debut) { params.push(date_debut); where.push(`m.date >= $${params.length}`); }
      if (date_fin) { params.push(date_fin); where.push(`m.date <= $${params.length}`); }
      params.push(parseInt(limit, 10) || 200);
      sql = `
        SELECT m.*, p.designation AS article_designation
        FROM stock_move m
        LEFT JOIN produits p ON m.product_id = p.id_produit
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY m.date DESC
        LIMIT $${params.length}
      `;
    }

    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getMoves');
  }
};

// ─── GET /api/warehouse/picking-types ────────────────────────────
// NOTE: renvoie une liste statique si la table stock_picking_type n'existe pas (placeholder).
const STATIC_PICKING_TYPES = [
  { id: 1, code: 'entree',     libelle: 'Entrée',      name: 'Réception' },
  { id: 2, code: 'sortie',     libelle: 'Sortie',      name: 'Livraison' },
  { id: 3, code: 'transfert',  libelle: 'Transfert',   name: 'Transfert interne' },
  { id: 4, code: 'inventaire', libelle: 'Inventaire',  name: 'Inventaire' },
];

export const getPickingTypes = async (req, res) => {
  try {
    const table = await pickTable(PT_TABLES);
    if (!table) {
      return sendSuccess(res, { items: STATIC_PICKING_TYPES, total: STATIC_PICKING_TYPES.length, note: 'Static list — table not available' });
    }
    const r = await pool.query(`SELECT * FROM ${table} WHERE COALESCE(active, true) = true ORDER BY 1 LIMIT 200`);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    // Fallback statique en cas d'erreur (ex : colonne active absente)
    try {
      const table = await pickTable(PT_TABLES);
      if (table) {
        const r = await pool.query(`SELECT * FROM ${table} ORDER BY 1 LIMIT 200`);
        return sendSuccess(res, { items: r.rows, total: r.rows.length });
      }
    } catch {}
    return handleError(res, error, 'getPickingTypes');
  }
};

// ─── POST /api/warehouse/picking-types ───────────────────────────
export const createPickingType = async (req, res) => {
  try {
    const table = await pickTable(PT_TABLES);
    const { name, code, libelle, warehouse_id, id_entrepot } = req.body || {};

    if (!table) {
      // Placeholder — pas de persistance
      const created = { id: Date.now(), name: name || libelle, code, libelle: libelle || name, _placeholder: true };
      return sendSuccess(res, created, 'Type d\'opération enregistré (placeholder — table absente)', 201);
    }

    const fields = [];
    const values = [];
    const push = (col, val) => { if (val !== undefined && val !== null) { fields.push(col); values.push(val); } };

    if (table === 'stock_picking_type') {
      push('name', name || libelle || code);
      push('code', code || 'internal');
      if (warehouse_id) push('warehouse_id', warehouse_id);
    } else {
      if (await columnExists(table, 'name')) push('name', name || libelle);
      if (await columnExists(table, 'libelle')) push('libelle', libelle || name);
      if (await columnExists(table, 'code')) push('code', code);
      if (id_entrepot && await columnExists(table, 'id_entrepot')) push('id_entrepot', id_entrepot);
    }

    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const r = await pool.query(sql, values);

    try {
      const io = await getIo();
      if (io) io.emit('warehouse:picking-type:created', r.rows[0]);
    } catch {}

    return sendSuccess(res, r.rows[0], 'Type d\'opération créé', 201);
  } catch (error) {
    return handleError(res, error, 'createPickingType');
  }
};
