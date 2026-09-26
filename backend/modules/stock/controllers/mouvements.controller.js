/**
 * Contrôleur Mouvements de Stock — CRUD sur `mouvements_stock`
 *
 * Endpoints:
 *   GET    /api/stock/mouvements                — Liste (filtrable)
 *   GET    /api/stock/mouvements/:id            — Détail
 *   POST   /api/stock/mouvements                — Créer
 *   PUT    /api/stock/mouvements/:id            — Modifier
 *   DELETE /api/stock/mouvements/:id            — Supprimer
 *
 * Le schéma de `mouvements_stock` étant variable, les colonnes sont
 * détectées dynamiquement via information_schema et l'INSERT/UPDATE ne
 * porte que sur celles qui existent.
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try { _io = (await import('../../../src/server.js')).io; } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

// ─── Cache des colonnes disponibles ───────────────────────────────
let _cols = null;
const getCols = async () => {
  if (_cols) return _cols;
  try {
    const r = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'mouvements_stock'`
    );
    _cols = new Set(r.rows.map((x) => x.column_name));
  } catch {
    _cols = new Set();
  }
  return _cols;
};

const pad3 = (n) => String(n).padStart(3, '0');
const ymd = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
};
const nextNumero = async () => {
  const cols = await getCols();
  const numCol = cols.has('numero_mouvement')
    ? 'numero_mouvement'
    : cols.has('reference')
    ? 'reference'
    : null;
  if (!numCol) return `MV-${ymd()}-001`;
  try {
    const r = await pool.query(
      `SELECT COUNT(*)::int AS c FROM mouvements_stock WHERE ${numCol} LIKE $1`,
      [`MV-${ymd()}-%`]
    );
    return `MV-${ymd()}-${pad3((r.rows[0].c || 0) + 1)}`;
  } catch {
    return `MV-${ymd()}-001`;
  }
};

// Choix d'un alias `id` en fonction du nom de PK réel
const idColumn = async () => {
  const cols = await getCols();
  if (cols.has('id_mouvement_stock')) return 'id_mouvement_stock';
  if (cols.has('id_mouvement')) return 'id_mouvement';
  if (cols.has('id')) return 'id';
  return 'id_mouvement';
};

const buildSelect = async () => {
  const idCol = await idColumn();
  return `
    SELECT
      m.*,
      m.${idCol} AS id,
      a.designation AS article_designation,
      a.code_article
    FROM mouvements_stock m
    LEFT JOIN articles_catalogue a ON m.id_article = a.id_article
  `;
};

// ─── GET /api/stock/mouvements ────────────────────────────────────
export const getMouvements = async (req, res) => {
  try {
    const { id_article, type, date_debut, date_fin, limit = 200 } = req.query;
    const cols = await getCols();
    const idCol = await idColumn();
    const params = [];
    const where = [];

    if (id_article) {
      params.push(id_article);
      where.push(`m.id_article = $${params.length}`);
    }
    if (type && cols.has('type_mouvement')) {
      params.push(type);
      where.push(`m.type_mouvement = $${params.length}`);
    } else if (type && cols.has('type')) {
      params.push(type);
      where.push(`m.type = $${params.length}`);
    }
    if (date_debut && cols.has('date_mouvement')) {
      params.push(date_debut);
      where.push(`m.date_mouvement >= $${params.length}`);
    }
    if (date_fin && cols.has('date_mouvement')) {
      params.push(date_fin);
      where.push(`m.date_mouvement <= $${params.length}`);
    }

    params.push(parseInt(limit, 10) || 200);
    const orderCol = cols.has('date_mouvement') ? 'm.date_mouvement' : `m.${idCol}`;
    const base = await buildSelect();
    const sql = `
      ${base}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY ${orderCol} DESC NULLS LAST
      LIMIT $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getMouvements');
  }
};

// ─── GET /api/stock/mouvements/:id ────────────────────────────────
export const getMouvementById = async (req, res) => {
  try {
    const idCol = await idColumn();
    const base = await buildSelect();
    const r = await pool.query(`${base} WHERE m.${idCol} = $1 LIMIT 1`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Mouvement introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getMouvementById');
  }
};

// ─── POST /api/stock/mouvements ───────────────────────────────────
export const createMouvement = async (req, res) => {
  try {
    const userId = authorId(req);
    const {
      id_article, quantite, type, motif, reference_document, id_emplacement,
    } = req.body || {};

    if (!id_article) return sendError(res, 'id_article requis', 400);
    if (quantite === undefined || quantite === null) return sendError(res, 'quantite requise', 400);
    if (!type) return sendError(res, 'type requis (entree|sortie|ajustement)', 400);

    const cols = await getCols();
    const idCol = await idColumn();
    const qte = Number(quantite);
    const signee = type === 'sortie' ? -Math.abs(qte) : type === 'entree' ? Math.abs(qte) : qte;
    const numero = await nextNumero();

    const data = {};
    if (cols.has('numero_mouvement')) data.numero_mouvement = numero;
    else if (cols.has('reference')) data.reference = numero;

    if (cols.has('id_article')) data.id_article = id_article;
    if (cols.has('quantite')) data.quantite = Math.abs(qte);
    if (cols.has('quantite_signee')) data.quantite_signee = signee;
    if (cols.has('type_mouvement')) data.type_mouvement = type;
    else if (cols.has('type')) data.type = type;
    if (cols.has('motif')) data.motif = motif || null;
    else if (cols.has('observations')) data.observations = motif || null;
    if (cols.has('reference_document')) data.reference_document = reference_document || null;
    if (cols.has('id_emplacement') && id_emplacement) data.id_emplacement = id_emplacement;
    if (cols.has('id_emplacement_destination') && id_emplacement && type === 'entree') {
      data.id_emplacement_destination = id_emplacement;
    }
    if (cols.has('id_emplacement_source') && id_emplacement && type === 'sortie') {
      data.id_emplacement_source = id_emplacement;
    }
    if (cols.has('date_mouvement')) data.date_mouvement = new Date();
    if (cols.has('statut')) data.statut = 'valide';
    if (cols.has('created_by') && userId) data.created_by = userId;

    const fields = Object.keys(data);
    if (!fields.length) return sendError(res, 'Aucune colonne insérable détectée', 500);
    const values = fields.map((f) => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `
      INSERT INTO mouvements_stock (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *, ${idCol} AS id
    `;
    const r = await pool.query(sql, values);
    const row = r.rows[0];
    try { const io = await getIo(); if (io) io.emit('stock:mouvement', row); } catch {}
    return sendSuccess(res, row, 'Mouvement créé', 201);
  } catch (error) {
    return handleError(res, error, 'createMouvement');
  }
};

// ─── PUT /api/stock/mouvements/:id ────────────────────────────────
export const updateMouvement = async (req, res) => {
  try {
    const userId = authorId(req);
    const cols = await getCols();
    const idCol = await idColumn();
    const excluded = new Set(['id', idCol, 'created_at', 'created_by', 'numero_mouvement']);
    const data = req.body || {};
    const fields = Object.keys(data).filter((f) => cols.has(f) && !excluded.has(f));
    if (!fields.length) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const values = fields.map((f) => data[f]);
    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const extras = [];
    if (cols.has('updated_at')) extras.push('updated_at = NOW()');
    if (cols.has('updated_by') && userId) { values.push(userId); extras.push(`updated_by = $${values.length}`); }
    values.push(req.params.id);
    const sql = `
      UPDATE mouvements_stock
      SET ${set}${extras.length ? ', ' + extras.join(', ') : ''}
      WHERE ${idCol} = $${values.length}
      RETURNING *, ${idCol} AS id
    `;
    const r = await pool.query(sql, values);
    if (!r.rows[0]) return sendError(res, 'Mouvement introuvable', 404);
    try { const io = await getIo(); if (io) io.emit('stock:mouvement', r.rows[0]); } catch {}
    return sendSuccess(res, r.rows[0], 'Mouvement mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateMouvement');
  }
};

// ─── DELETE /api/stock/mouvements/:id ─────────────────────────────
export const deleteMouvement = async (req, res) => {
  try {
    const idCol = await idColumn();
    const r = await pool.query(
      `DELETE FROM mouvements_stock WHERE ${idCol} = $1 RETURNING ${idCol} AS id`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Mouvement introuvable', 404);
    try { const io = await getIo(); if (io) io.emit('stock:mouvement', { id: r.rows[0].id, deleted: true }); } catch {}
    return sendSuccess(res, { id: r.rows[0].id }, 'Mouvement supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteMouvement');
  }
};
