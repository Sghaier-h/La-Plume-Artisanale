/**
 * Contrôleur Modeles — catalogue fouta
 *
 * Endpoints :
 *   GET    /api/modeles                       — Liste (filtres)
 *   GET    /api/modeles/stats/categories      — Comptage par catégorie
 *   GET    /api/modeles/code/:code            — Lookup par code_modele
 *   GET    /api/modeles/:id                   — Détail
 *   POST   /api/modeles                       — Créer
 *   PUT    /api/modeles/:id                   — Mise à jour
 *   POST   /api/modeles/:id/upload-photo      — Upload photo (multer)
 *   DELETE /api/modeles/:id                   — Soft delete
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try { _io = (await import('../../../src/server.js')).io; } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

// ─── Multer (disk) ───────────────────────────────────────────────
const uploadRoot = path.resolve(process.cwd(), 'uploads', 'modeles');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadRoot, String(req.params.id));
    try { fs.mkdirSync(dir, { recursive: true }); } catch {}
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `photo-${Date.now()}${ext}`);
  },
});
export const uploadPhotoMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\//i.test(file.mimetype)) return cb(new Error('Fichier image requis'));
    cb(null, true);
  },
}).single('image');

// ─── GET /api/modeles ────────────────────────────────────────────
export const getModeles = async (req, res) => {
  try {
    const { categorie, search, actif } = req.query;
    const params = [];
    const where = [];

    if (actif === 'false' || actif === false)      where.push('m.active = false');
    else if (actif === 'true' || actif === true)   where.push('m.active = true');
    else                                            where.push('(m.active IS NULL OR m.active = true)');

    if (categorie) { params.push(categorie); where.push(`m.categorie = $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(m.libelle ILIKE $${params.length} OR m.code_modele ILIKE $${params.length} OR m.name ILIKE $${params.length})`);
    }

    const sql = `
      SELECT m.*, m.id_modeles AS id
      FROM modeles m
      WHERE ${where.join(' AND ')}
      ORDER BY m.code_modele NULLS LAST, m.created_at DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getModeles');
  }
};

// ─── GET /api/modeles/stats/categories ───────────────────────────
export const getModelesStatsCategories = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT categorie, COUNT(*)::int AS total
       FROM modeles
       WHERE (active IS NULL OR active = true)
       GROUP BY categorie
       ORDER BY total DESC`
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getModelesStatsCategories');
  }
};

// ─── GET /api/modeles/code/:code ─────────────────────────────────
export const getModeleByCode = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT *, id_modeles AS id FROM modeles WHERE code_modele = $1 LIMIT 1`,
      [req.params.code]
    );
    if (!r.rows[0]) return sendError(res, 'Modèle introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getModeleByCode');
  }
};

// ─── GET /api/modeles/:id ────────────────────────────────────────
export const getModelesById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT *, id_modeles AS id FROM modeles WHERE id_modeles = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Modèle introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getModelesById');
  }
};

// ─── POST /api/modeles ───────────────────────────────────────────
export const createModeles = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const { code_modele, libelle, categorie, dimensions_std, composition, prix_base,
            image_url, name, description } = req.body || {};

    if (!libelle && !name) return sendError(res, 'Libellé requis', 400);

    const r = await pool.query(
      `INSERT INTO modeles
         (name, description, code_modele, libelle, categorie, dimensions_std, composition,
          prix_base, image_url, active, created_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), $10)
       RETURNING *`,
      [name || libelle, description || null, code_modele || null, libelle || name,
       categorie || null, dimensions_std || null, composition || null,
       prix_base ?? null, image_url || null, userId]
    );
    return sendSuccess(res, r.rows[0], 'Modèle créé', 201);
  } catch (error) {
    return handleError(res, error, 'createModeles');
  }
};

// ─── PUT /api/modeles/:id ────────────────────────────────────────
export const updateModeles = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const allowed = ['name','description','code_modele','libelle','categorie',
                     'dimensions_std','composition','prix_base','image_url','active'];
    const fields = Object.keys(req.body || {}).filter(k => allowed.includes(k));
    if (!fields.length) return sendError(res, 'Aucune donnée à mettre à jour', 400);

    const values = fields.map(f => req.body[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const r = await pool.query(
      `UPDATE modeles SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
       WHERE id_modeles = $${values.length + 2} RETURNING *`,
      [...values, userId, req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Modèle introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Modèle mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateModeles');
  }
};

// ─── POST /api/modeles/:id/upload-photo ──────────────────────────
export const uploadPhoto = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const id = req.params.id;

    let image_url = null;

    if (req.file) {
      const rel = path.posix.join('/uploads/modeles', String(id), req.file.filename);
      image_url = rel;
    } else if (req.body?.image_data) {
      // Fallback base64 : { image_data: "data:image/png;base64,...", filename?: "x.png" }
      const m = /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/.exec(req.body.image_data);
      if (!m) return sendError(res, 'image_data invalide (data URI attendu)', 400);
      const ext = m[1].split('/')[1].replace(/\+.*$/, '') || 'png';
      const dir = path.join(uploadRoot, String(id));
      try { fs.mkdirSync(dir, { recursive: true }); } catch {}
      const name = `photo-${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(dir, name), Buffer.from(m[2], 'base64'));
      image_url = path.posix.join('/uploads/modeles', String(id), name);
    } else {
      return sendError(res, 'Aucun fichier fourni (image ou image_data)', 400);
    }

    const r = await pool.query(
      `UPDATE modeles SET image_url = $1, updated_at = NOW(), updated_by = $2
       WHERE id_modeles = $3 RETURNING *`,
      [image_url, userId, id]
    );
    if (!r.rows[0]) return sendError(res, 'Modèle introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('modele:photo', { id, image_url });
    } catch {}

    return sendSuccess(res, r.rows[0], 'Photo mise à jour');
  } catch (error) {
    return handleError(res, error, 'uploadPhoto');
  }
};

// ─── DELETE /api/modeles/:id ─────────────────────────────────────
export const deleteModeles = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const r = await pool.query(
      `UPDATE modeles SET active = false, updated_at = NOW(), updated_by = $2
       WHERE id_modeles = $1 RETURNING id_modeles`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Modèle introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_modeles }, 'Modèle désactivé');
  } catch (error) {
    return handleError(res, error, 'deleteModeles');
  }
};
