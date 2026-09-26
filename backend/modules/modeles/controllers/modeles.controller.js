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
      SELECT m.*, m.id_modele AS id
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
      `SELECT *, id_modele AS id FROM modeles WHERE code_modele = $1 LIMIT 1`,
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
      `SELECT *, id_modele AS id FROM modeles WHERE id_modele = $1 LIMIT 1`,
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
       WHERE id_modele = $${values.length + 2} RETURNING *`,
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
       WHERE id_modele = $3 RETURNING *`,
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

// ─── Helper: agrège le stock disponible par article (best-effort) ────────
const fetchStockMap = async (ids) => {
  const out = new Map();
  if (!ids?.length) return out;
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const tryQueries = [
    `SELECT id_article,
            COALESCE(SUM(CASE WHEN statut IN ('reserve') THEN quantite_disponible ELSE 0 END), 0) AS reserve,
            COALESCE(SUM(CASE WHEN statut IN ('disponible','en_stock') THEN quantite_disponible ELSE 0 END), 0) AS dispo,
            COALESCE(SUM(quantite_disponible), 0) AS actuel
       FROM stock_produits_finis
      WHERE id_article IN (${placeholders})
      GROUP BY id_article`,
    `SELECT id_article,
            0 AS reserve,
            COALESCE(SUM(quantite), 0) AS dispo,
            COALESCE(SUM(quantite), 0) AS actuel
       FROM stock_pf
      WHERE id_article IN (${placeholders})
      GROUP BY id_article`,
  ];
  for (const q of tryQueries) {
    try {
      const r = await pool.query(q, ids);
      for (const row of r.rows) {
        out.set(Number(row.id_article), {
          stock_actuel: Number(row.actuel) || 0,
          stock_reserve: Number(row.reserve) || 0,
          stock_disponible: Math.max(0, (Number(row.dispo) || 0) - (Number(row.reserve) || 0)),
        });
      }
      if (out.size) return out;
    } catch { /* try next */ }
  }
  return out;
};

// ─── Helper: charge modèle + variantes + référentiels ────────────────────
const loadVariantes = async (modeleId) => {
  const mRes = await pool.query(
    `SELECT id_modele, code_modele, libelle, categorie, image_url,
            dimensions_std, composition, prix_base
       FROM modeles WHERE id_modele = $1 LIMIT 1`,
    [modeleId]
  );
  const modele = mRes.rows[0];
  if (!modele) return null;

  const aRes = await pool.query(
    `SELECT a.id_article, a.code_article, a.designation,
            a.id_dimension,        d.libelle AS dimension_libelle,
            a.id_couleur,          c.nom     AS couleur_libelle, c.code_hex AS couleur_hex,
            a.id_finition,         f.libelle AS finition_libelle,
            a.id_tissage,          t.libelle AS tissage_libelle,
            a.id_personnalisation, p.libelle AS personnalisation_libelle,
            a.id_nombre_couleurs,  nc.libelle AS nombre_couleurs_libelle,
            a.prix_vente, a.prix_revient, a.prix_unitaire_base,
            a.qte_minimal_stock, a.image_url, a.temps_production_standard,
            a.actif
       FROM articles_catalogue a
       LEFT JOIN parametres_dimensions       d  ON a.id_dimension = d.id
       LEFT JOIN parametres_couleurs         c  ON a.id_couleur = c.id
       LEFT JOIN parametres_finitions        f  ON a.id_finition = f.id
       LEFT JOIN parametres_tissages         t  ON a.id_tissage = t.id
       LEFT JOIN parametres_personnalisations p ON a.id_personnalisation = p.id
       LEFT JOIN parametres_nombre_couleurs  nc ON a.id_nombre_couleurs = nc.id
       WHERE a.id_modele = $1 AND (a.actif IS NULL OR a.actif = true)
       ORDER BY d.libelle NULLS LAST, c.nom NULLS LAST`,
    [modeleId]
  );

  const ids = aRes.rows.map((r) => r.id_article);
  const stockMap = await fetchStockMap(ids);

  const variantes = aRes.rows.map((r) => {
    const s = stockMap.get(Number(r.id_article)) || { stock_actuel: 0, stock_reserve: 0, stock_disponible: 0 };
    const min = Number(r.qte_minimal_stock) || 0;
    return {
      ...r,
      prix_vente: r.prix_vente != null ? Number(r.prix_vente) : Number(r.prix_unitaire_base) || 0,
      prix_revient: r.prix_revient != null ? Number(r.prix_revient) : null,
      stock_actuel: s.stock_actuel,
      stock_reserve: s.stock_reserve,
      stock_disponible: s.stock_disponible,
      stock_alerte: s.stock_disponible <= min,
    };
  });

  // Attributs disponibles (déduits des variantes)
  const uniq = (arr, key) => {
    const seen = new Map();
    for (const v of arr) {
      const id = v[key];
      if (id == null || seen.has(id)) continue;
      seen.set(id, v);
    }
    return [...seen.values()];
  };
  const attributs_disponibles = {
    dimensions: uniq(variantes, 'id_dimension')
      .map((v) => ({ id_dimension: v.id_dimension, libelle: v.dimension_libelle }))
      .filter((x) => x.id_dimension != null),
    couleurs: uniq(variantes, 'id_couleur')
      .map((v) => ({ id_couleur: v.id_couleur, libelle: v.couleur_libelle, hex: v.couleur_hex }))
      .filter((x) => x.id_couleur != null),
    finitions: uniq(variantes, 'id_finition')
      .map((v) => ({ id_finition: v.id_finition, libelle: v.finition_libelle }))
      .filter((x) => x.id_finition != null),
    tissages: uniq(variantes, 'id_tissage')
      .map((v) => ({ id_tissage: v.id_tissage, libelle: v.tissage_libelle }))
      .filter((x) => x.id_tissage != null),
    personnalisations: uniq(variantes, 'id_personnalisation')
      .map((v) => ({ id_personnalisation: v.id_personnalisation, libelle: v.personnalisation_libelle }))
      .filter((x) => x.id_personnalisation != null),
    nombres_couleurs: uniq(variantes, 'id_nombre_couleurs')
      .map((v) => ({ id_nombre_couleurs: v.id_nombre_couleurs, libelle: v.nombre_couleurs_libelle }))
      .filter((x) => x.id_nombre_couleurs != null),
  };

  return { modele, attributs_disponibles, variantes };
};

// ─── GET /api/modeles/:id/variantes ──────────────────────────────
export const getModeleVariantes = async (req, res) => {
  try {
    const data = await loadVariantes(req.params.id);
    if (!data) return sendError(res, 'Modèle introuvable', 404);
    return sendSuccess(res, { ...data, total: data.variantes.length });
  } catch (error) {
    return handleError(res, error, 'getModeleVariantes');
  }
};

// ─── GET /api/modeles/:id/matrice ────────────────────────────────
export const getModeleMatrice = async (req, res) => {
  try {
    const data = await loadVariantes(req.params.id);
    if (!data) return sendError(res, 'Modèle introuvable', 404);

    const dimensions = data.attributs_disponibles.dimensions.map((d) => ({
      id: d.id_dimension, libelle: d.libelle,
    }));
    const couleurs = data.attributs_disponibles.couleurs.map((c) => ({
      id: c.id_couleur, libelle: c.libelle, hex: c.hex,
    }));

    // matrice[rowCouleur][colDimension] = variante ou null
    const matrice = couleurs.map((c) =>
      dimensions.map((d) => {
        const v = data.variantes.find(
          (x) => x.id_couleur === c.id && x.id_dimension === d.id
        );
        if (!v) return null;
        return {
          id_article: v.id_article,
          code_article: v.code_article,
          designation: v.designation,
          prix_vente: v.prix_vente,
          stock_disponible: v.stock_disponible,
          stock_actuel: v.stock_actuel,
          qte_minimal_stock: v.qte_minimal_stock,
          alerte: v.stock_alerte,
        };
      })
    );

    return sendSuccess(res, { modele: data.modele, dimensions, couleurs, matrice });
  } catch (error) {
    return handleError(res, error, 'getModeleMatrice');
  }
};

// ─── DELETE /api/modeles/:id ─────────────────────────────────────
export const deleteModeles = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const r = await pool.query(
      `UPDATE modeles SET active = false, updated_at = NOW(), updated_by = $2
       WHERE id_modele = $1 RETURNING id_modele`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Modèle introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_modele }, 'Modèle désactivé');
  } catch (error) {
    return handleError(res, error, 'deleteModeles');
  }
};
