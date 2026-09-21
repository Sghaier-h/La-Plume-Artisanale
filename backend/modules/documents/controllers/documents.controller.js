/**
 * Contrôleur Documents — GED (métadonnées)
 *
 * Endpoints :
 *   GET    /api/documents                     — Liste (filtrable)
 *   GET    /api/documents/stats/global        — Stats globales
 *   GET    /api/documents/entity/:type/:id    — Documents liés à une entité
 *   POST   /api/documents/upload              — Placeholder multipart (multer non configuré)
 *   GET    /api/documents/:id                 — Détail
 *   GET    /api/documents/:id/download        — Placeholder de téléchargement
 *   POST   /api/documents                     — Créer métadonnées
 *   PUT    /api/documents/:id                 — MAJ métadonnées
 *   DELETE /api/documents/:id
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const authorId = (req) => req.user?.id || req.user?.userId || null;

// Migration idempotente : ajouter les colonnes GED au chargement
(async () => {
  try {
    await pool.query(`
      ALTER TABLE documents
        ADD COLUMN IF NOT EXISTS filename VARCHAR(255),
        ADD COLUMN IF NOT EXISTS filepath TEXT,
        ADD COLUMN IF NOT EXISTS mimetype VARCHAR(100),
        ADD COLUMN IF NOT EXISTS size_bytes BIGINT,
        ADD COLUMN IF NOT EXISTS categorie VARCHAR(100),
        ADD COLUMN IF NOT EXISTS tags TEXT[],
        ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS entity_id INTEGER,
        ADD COLUMN IF NOT EXISTS uploaded_by INTEGER,
        ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false
    `);
  } catch (err) {
    console.warn('[documents] migration ALTER TABLE échouée:', err.message);
  }
})();

// ─── GET /api/documents ───────────────────────────────────────────
export const getDocuments = async (req, res) => {
  try {
    const { categorie, entity_type, entity_id, search, is_public, limit = 100, offset = 0 } = req.query;
    const params = [];
    const where = ['d.filename IS NOT NULL'];

    if (categorie) { params.push(categorie); where.push(`d.categorie = $${params.length}`); }
    if (entity_type) { params.push(entity_type); where.push(`d.entity_type = $${params.length}`); }
    if (entity_id) { params.push(entity_id); where.push(`d.entity_id = $${params.length}`); }
    if (is_public === 'true' || is_public === true) where.push(`d.is_public = true`);
    else if (is_public === 'false' || is_public === false) where.push(`d.is_public = false`);
    if (search) {
      params.push(`%${search}%`);
      where.push(`(d.filename ILIKE $${params.length} OR d.name ILIKE $${params.length})`);
    }

    params.push(parseInt(limit, 10) || 100);
    params.push(parseInt(offset, 10) || 0);

    const sql = `
      SELECT d.id_documents AS id, d.name, d.description, d.filename, d.filepath, d.mimetype,
             d.size_bytes, d.categorie, d.tags, d.entity_type, d.entity_id, d.uploaded_by, d.is_public,
             d.created_at, d.updated_at,
             u.email AS uploader_email
      FROM documents d
      LEFT JOIN utilisateurs u ON d.uploaded_by = u.id_utilisateur
      WHERE ${where.join(' AND ')}
      ORDER BY d.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getDocuments');
  }
};

// ─── GET /api/documents/stats/global ──────────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const total = await pool.query(`SELECT COUNT(*)::int AS total FROM documents WHERE filename IS NOT NULL`);
    const parCat = await pool.query(
      `SELECT COALESCE(categorie, 'non-classé') AS categorie, COUNT(*)::int AS count
       FROM documents WHERE filename IS NOT NULL
       GROUP BY categorie ORDER BY count DESC`
    );
    const parType = await pool.query(
      `SELECT COALESCE(mimetype, 'inconnu') AS mimetype, COUNT(*)::int AS count
       FROM documents WHERE filename IS NOT NULL
       GROUP BY mimetype ORDER BY count DESC`
    );
    const size = await pool.query(
      `SELECT COALESCE(SUM(size_bytes), 0)::bigint AS total_bytes FROM documents WHERE filename IS NOT NULL`
    );
    return sendSuccess(res, {
      total: total.rows[0].total,
      par_categorie: parCat.rows,
      par_type: parType.rows,
      size_total_mb: +(Number(size.rows[0].total_bytes) / (1024 * 1024)).toFixed(2),
    });
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/documents/entity/:type/:id ──────────────────────────
export const getByEntity = async (req, res) => {
  try {
    const { type, id } = req.params;
    const r = await pool.query(
      `SELECT id_documents AS id, name, filename, filepath, mimetype, size_bytes, categorie, tags,
              entity_type, entity_id, uploaded_by, is_public, created_at
       FROM documents
       WHERE entity_type = $1 AND entity_id = $2 AND filename IS NOT NULL
       ORDER BY created_at DESC`,
      [type, id]
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getByEntity');
  }
};

// ─── POST /api/documents/upload ───────────────────────────────────
export const uploadDocument = async (req, res) => {
  return res.status(202).json({
    success: true,
    note: 'File upload — configure multer to save to uploads/documents/ and update metadata row',
  });
};

// ─── GET /api/documents/:id ───────────────────────────────────────
export const getDocumentById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT d.*, d.id_documents AS id, u.email AS uploader_email
       FROM documents d
       LEFT JOIN utilisateurs u ON d.uploaded_by = u.id_utilisateur
       WHERE d.id_documents = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Document introuvable', 404);
    const doc = r.rows[0];
    doc.download_url = `/api/documents/${doc.id}/download`;
    return sendSuccess(res, doc);
  } catch (error) {
    return handleError(res, error, 'getDocumentById');
  }
};

// ─── GET /api/documents/:id/download ──────────────────────────────
export const downloadDocument = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT filename, filepath, mimetype FROM documents WHERE id_documents = $1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Document introuvable', 404);
    return res.status(200).json({
      success: true,
      note: 'File download not yet implemented',
      filepath: r.rows[0].filepath,
      filename: r.rows[0].filename,
      mimetype: r.rows[0].mimetype,
    });
  } catch (error) {
    return handleError(res, error, 'downloadDocument');
  }
};

// ─── POST /api/documents ──────────────────────────────────────────
export const createDocument = async (req, res) => {
  try {
    const userId = authorId(req);
    const { filename, mimetype, size_bytes, categorie, tags, entity_type, entity_id, name, description, is_public } = req.body || {};
    if (!filename) return sendError(res, 'filename requis', 400);

    const r = await pool.query(
      `INSERT INTO documents
         (name, description, filename, mimetype, size_bytes, categorie, tags, entity_type, entity_id,
          uploaded_by, is_public, active, created_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), $10)
       RETURNING id_documents AS id, name, filename, mimetype, size_bytes, categorie, tags,
                 entity_type, entity_id, uploaded_by, is_public, created_at`,
      [
        name || filename,
        description || null,
        filename,
        mimetype || null,
        size_bytes || null,
        categorie || null,
        Array.isArray(tags) ? tags : null,
        entity_type || null,
        entity_id || null,
        userId,
        !!is_public,
      ]
    );
    return sendSuccess(res, r.rows[0], 'Document créé', 201);
  } catch (error) {
    return handleError(res, error, 'createDocument');
  }
};

// ─── PUT /api/documents/:id ───────────────────────────────────────
export const updateDocument = async (req, res) => {
  try {
    const userId = authorId(req);
    const { name, description, categorie, tags, entity_type, entity_id, is_public } = req.body || {};
    const r = await pool.query(
      `UPDATE documents
         SET name = COALESCE($2, name),
             description = COALESCE($3, description),
             categorie = COALESCE($4, categorie),
             tags = COALESCE($5, tags),
             entity_type = COALESCE($6, entity_type),
             entity_id = COALESCE($7, entity_id),
             is_public = COALESCE($8, is_public),
             updated_at = NOW(), updated_by = $9
       WHERE id_documents = $1
       RETURNING id_documents AS id, name, description, categorie, tags, entity_type, entity_id, is_public`,
      [req.params.id, name ?? null, description ?? null, categorie ?? null,
       Array.isArray(tags) ? tags : null, entity_type ?? null, entity_id ?? null,
       is_public ?? null, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Document introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Document mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateDocument');
  }
};

// ─── DELETE /api/documents/:id ────────────────────────────────────
export const deleteDocument = async (req, res) => {
  try {
    const r = await pool.query(
      `DELETE FROM documents WHERE id_documents = $1 RETURNING id_documents`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Document introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_documents }, 'Document supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteDocument');
  }
};
