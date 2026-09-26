/**
 * Contrôleur Parametrage — Paramètres généraux de l'ERP
 *
 * Endpoints:
 *   GET    /api/parametrage                  — Liste (filtrable)
 *   GET    /api/parametrage/categories       — Catégories distinctes
 *   GET    /api/parametrage/export           — Export JSON
 *   POST   /api/parametrage/import           — Import JSON (bulk upsert)
 *   GET    /api/parametrage/cle/:cle         — Détail par clé
 *   PUT    /api/parametrage/cle/:cle         — Upsert par clé
 *   GET    /api/parametrage/:id              — Détail par id
 *   POST   /api/parametrage                  — Créer
 *   PUT    /api/parametrage/:id              — Update
 *   DELETE /api/parametrage/:id              — Supprimer
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const currentUserId = (req) => req.user?.id || req.user?.userId || null;
const isAdmin = (req) => req.user?.role === 'ADMIN';

const DEFAULT_SEED = [
  { cle: 'app.nom', valeur: 'La Plume Artisanale', type_valeur: 'string', categorie: 'application', editable_ui: true },
  { cle: 'app.devise', valeur: 'DT', type_valeur: 'string', categorie: 'financier', editable_ui: true },
  { cle: 'app.tva_defaut', valeur: '19', type_valeur: 'number', categorie: 'financier', editable_ui: true },
  { cle: 'planning.jours_ouvres', valeur: '5', type_valeur: 'number', categorie: 'planning', editable_ui: true },
  { cle: 'stock.seuil_alerte_default', valeur: '10', type_valeur: 'number', categorie: 'stock', editable_ui: true },
];

// Migration idempotente + seed
(async () => {
  try {
    await pool.query(`
      ALTER TABLE parametrage
        ADD COLUMN IF NOT EXISTS cle VARCHAR(200),
        ADD COLUMN IF NOT EXISTS valeur TEXT,
        ADD COLUMN IF NOT EXISTS type_valeur VARCHAR(20) DEFAULT 'string',
        ADD COLUMN IF NOT EXISTS categorie VARCHAR(100),
        ADD COLUMN IF NOT EXISTS editable_ui BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS date_modification TIMESTAMP
    `);
    try {
      await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_parametrage_cle ON parametrage(cle) WHERE cle IS NOT NULL`);
    } catch {}

    const exists = await pool.query(`SELECT COUNT(*)::int AS c FROM parametrage WHERE cle IS NOT NULL`);
    if (exists.rows[0].c === 0) {
      for (const p of DEFAULT_SEED) {
        try {
          await pool.query(
            `INSERT INTO parametrage (cle, valeur, type_valeur, categorie, editable_ui, date_creation)
             VALUES ($1,$2,$3,$4,$5,NOW()) ON CONFLICT DO NOTHING`,
            [p.cle, p.valeur, p.type_valeur, p.categorie, p.editable_ui]
          );
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[parametrage] migration/seed ALTER TABLE échouée:', err.message);
  }
})();

// Identifie la colonne PK (id_parametrage, id_parametres, id, etc.)
let _pkColumnCache = null;
const getPkColumn = async () => {
  if (_pkColumnCache) return _pkColumnCache;
  const r = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'parametrage' AND column_name ILIKE 'id%'
    ORDER BY ordinal_position LIMIT 1
  `);
  _pkColumnCache = r.rows[0]?.column_name || 'id';
  return _pkColumnCache;
};

const castValue = (row) => {
  if (!row) return row;
  const { type_valeur, valeur } = row;
  let parsed = valeur;
  try {
    if (type_valeur === 'number') parsed = valeur !== null ? Number(valeur) : null;
    else if (type_valeur === 'boolean') parsed = valeur === 'true' || valeur === true;
    else if (type_valeur === 'json') parsed = valeur ? JSON.parse(valeur) : null;
  } catch {}
  return { ...row, valeur_typed: parsed };
};

// ─── GET /api/parametrage ─────────────────────────────────────────
export const getParametrage = async (req, res) => {
  try {
    const pk = await getPkColumn();
    const { categorie, editable_ui } = req.query;
    const params = [];
    const where = ['cle IS NOT NULL'];
    if (categorie) { params.push(categorie); where.push(`categorie = $${params.length}`); }
    if (editable_ui === 'true') where.push('editable_ui = true');
    else if (editable_ui === 'false') where.push('editable_ui = false');

    const r = await pool.query(
      `SELECT ${pk} AS id, cle, valeur, type_valeur, categorie, editable_ui,
              date_creation, date_modification
       FROM parametrage WHERE ${where.join(' AND ')}
       ORDER BY categorie NULLS LAST, cle`,
      params
    );
    return sendSuccess(res, { items: r.rows.map(castValue), total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getParametrage');
  }
};

// ─── GET /api/parametrage/categories ──────────────────────────────
export const getCategories = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT DISTINCT categorie FROM parametrage WHERE categorie IS NOT NULL ORDER BY categorie`
    );
    return sendSuccess(res, { items: r.rows.map(row => row.categorie), total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getCategories');
  }
};

// ─── GET /api/parametrage/export ──────────────────────────────────
export const exportParametrage = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT cle, valeur, type_valeur, categorie, editable_ui FROM parametrage WHERE cle IS NOT NULL ORDER BY cle`
    );
    return sendSuccess(res, {
      exported_at: new Date().toISOString(),
      count: r.rows.length,
      params: r.rows,
    });
  } catch (error) {
    return handleError(res, error, 'exportParametrage');
  }
};

// ─── POST /api/parametrage/import ─────────────────────────────────
export const importParametrage = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const { params } = req.body || {};
    if (!Array.isArray(params)) return sendError(res, 'params (array) requis', 400);

    let inserted = 0;
    let updated = 0;
    for (const p of params) {
      if (!p.cle) continue;
      const existing = await pool.query(`SELECT 1 FROM parametrage WHERE cle = $1 LIMIT 1`, [p.cle]);
      if (existing.rows[0]) {
        await pool.query(
          `UPDATE parametrage SET valeur=$1, type_valeur=COALESCE($2, type_valeur),
                  categorie=COALESCE($3, categorie), editable_ui=COALESCE($4, editable_ui),
                  date_modification=NOW() WHERE cle=$5`,
          [p.valeur ?? null, p.type_valeur || null, p.categorie || null, p.editable_ui ?? null, p.cle]
        );
        updated++;
      } else {
        await pool.query(
          `INSERT INTO parametrage (cle, valeur, type_valeur, categorie, editable_ui, date_creation)
           VALUES ($1,$2,$3,$4,$5,NOW())`,
          [p.cle, p.valeur ?? null, p.type_valeur || 'string', p.categorie || null, p.editable_ui ?? true]
        );
        inserted++;
      }
    }
    return sendSuccess(res, { inserted, updated, total: params.length }, 'Import terminé');
  } catch (error) {
    return handleError(res, error, 'importParametrage');
  }
};

// ─── GET /api/parametrage/cle/:cle ────────────────────────────────
export const getByCle = async (req, res) => {
  try {
    const pk = await getPkColumn();
    const r = await pool.query(
      `SELECT ${pk} AS id, cle, valeur, type_valeur, categorie, editable_ui,
              date_creation, date_modification
       FROM parametrage WHERE cle = $1 LIMIT 1`,
      [req.params.cle]
    );
    if (!r.rows[0]) return sendError(res, 'Paramètre introuvable', 404);
    return sendSuccess(res, castValue(r.rows[0]));
  } catch (error) {
    return handleError(res, error, 'getByCle');
  }
};

// ─── PUT /api/parametrage/cle/:cle ────────────────────────────────
export const upsertByCle = async (req, res) => {
  try {
    const { valeur, type_valeur, categorie, editable_ui } = req.body || {};
    const existing = await pool.query(`SELECT 1 FROM parametrage WHERE cle = $1`, [req.params.cle]);
    if (existing.rows[0]) {
      await pool.query(
        `UPDATE parametrage
           SET valeur = COALESCE($1, valeur),
               type_valeur = COALESCE($2, type_valeur),
               categorie = COALESCE($3, categorie),
               editable_ui = COALESCE($4, editable_ui),
               date_modification = NOW()
         WHERE cle = $5`,
        [valeur ?? null, type_valeur || null, categorie || null, editable_ui ?? null, req.params.cle]
      );
    } else {
      await pool.query(
        `INSERT INTO parametrage (cle, valeur, type_valeur, categorie, editable_ui, date_creation)
         VALUES ($1,$2,$3,$4,$5,NOW())`,
        [req.params.cle, valeur ?? null, type_valeur || 'string', categorie || null, editable_ui ?? true]
      );
    }
    return sendSuccess(res, { cle: req.params.cle }, 'Paramètre enregistré');
  } catch (error) {
    return handleError(res, error, 'upsertByCle');
  }
};

// ── Helper : liste des paramètres par préfixe(s) de clé ───────────
const _getByPrefixes = async (prefixes) => {
  const pk = await getPkColumn();
  const conds = prefixes.map((_, i) => `cle ILIKE $${i + 1}`).join(' OR ');
  const params = prefixes.map(p => `${p}%`);
  const r = await pool.query(
    `SELECT ${pk} AS id, cle, valeur, type_valeur, categorie, editable_ui,
            date_creation, date_modification
     FROM parametrage
     WHERE cle IS NOT NULL AND (${conds})
     ORDER BY cle`,
    params
  );
  return r.rows.map(castValue);
};

// ── Helper : upsert multiple ──────────────────────────────────────
const _bulkUpsert = async (items, allowedPrefixes = null) => {
  let inserted = 0, updated = 0;
  for (const p of items || []) {
    if (!p.cle) continue;
    if (allowedPrefixes && !allowedPrefixes.some(prefix => p.cle.toLowerCase().startsWith(prefix.toLowerCase()))) {
      continue;
    }
    const existing = await pool.query(`SELECT 1 FROM parametrage WHERE cle = $1 LIMIT 1`, [p.cle]);
    if (existing.rows[0]) {
      await pool.query(
        `UPDATE parametrage SET valeur=$1, type_valeur=COALESCE($2, type_valeur),
                categorie=COALESCE($3, categorie), editable_ui=COALESCE($4, editable_ui),
                date_modification=NOW() WHERE cle=$5`,
        [p.valeur ?? null, p.type_valeur || null, p.categorie || null, p.editable_ui ?? null, p.cle]
      );
      updated++;
    } else {
      await pool.query(
        `INSERT INTO parametrage (cle, valeur, type_valeur, categorie, editable_ui, date_creation)
         VALUES ($1,$2,$3,$4,$5,NOW())`,
        [p.cle, p.valeur ?? null, p.type_valeur || 'string', p.categorie || null, p.editable_ui ?? true]
      );
      inserted++;
    }
  }
  return { inserted, updated };
};

// ─── GET /api/parametrage/societe ─────────────────────────────────
export const getSociete = async (req, res) => {
  try {
    const items = await _getByPrefixes(['app.', 'societe.']);
    return sendSuccess(res, { items, total: items.length });
  } catch (error) {
    return handleError(res, error, 'getSociete');
  }
};

// ─── PUT /api/parametrage/societe ─────────────────────────────────
export const updateSociete = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const body = req.body || {};
    const params = Array.isArray(body) ? body : (Array.isArray(body.params) ? body.params : null);
    if (!params) return sendError(res, 'params (array) requis', 400);
    const result = await _bulkUpsert(params, ['app.', 'societe.']);
    return sendSuccess(res, { ...result, total: params.length }, 'Paramètres société mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateSociete');
  }
};

// ─── GET /api/parametrage/systeme ─────────────────────────────────
export const getSysteme = async (req, res) => {
  try {
    const items = await _getByPrefixes(['app.', 'systeme.']);
    return sendSuccess(res, { items, total: items.length });
  } catch (error) {
    return handleError(res, error, 'getSysteme');
  }
};

// ─── PUT /api/parametrage/systeme/:cle ────────────────────────────
export const updateSystemeCle = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const cle = req.params.cle;
    const lower = (cle || '').toLowerCase();
    if (!lower.startsWith('app.') && !lower.startsWith('systeme.')) {
      return sendError(res, 'Clé hors périmètre systeme (app.* ou systeme.*)', 400);
    }
    const { valeur, type_valeur, categorie, editable_ui } = req.body || {};
    const existing = await pool.query(`SELECT 1 FROM parametrage WHERE cle = $1`, [cle]);
    if (existing.rows[0]) {
      await pool.query(
        `UPDATE parametrage
           SET valeur = COALESCE($1, valeur),
               type_valeur = COALESCE($2, type_valeur),
               categorie = COALESCE($3, categorie),
               editable_ui = COALESCE($4, editable_ui),
               date_modification = NOW()
         WHERE cle = $5`,
        [valeur ?? null, type_valeur || null, categorie || null, editable_ui ?? null, cle]
      );
    } else {
      await pool.query(
        `INSERT INTO parametrage (cle, valeur, type_valeur, categorie, editable_ui, date_creation)
         VALUES ($1,$2,$3,$4,$5,NOW())`,
        [cle, valeur ?? null, type_valeur || 'string', categorie || 'systeme', editable_ui ?? true]
      );
    }
    return sendSuccess(res, { cle }, 'Paramètre système enregistré');
  } catch (error) {
    return handleError(res, error, 'updateSystemeCle');
  }
};

// ─── GET /api/parametrage/module/:module ──────────────────────────
export const getByModule = async (req, res) => {
  try {
    const mod = (req.params.module || '').toLowerCase();
    if (!mod) return sendError(res, 'module requis', 400);
    const items = await _getByPrefixes([`${mod}.`]);
    return sendSuccess(res, { items, total: items.length });
  } catch (error) {
    return handleError(res, error, 'getByModule');
  }
};

// ─── PUT /api/parametrage/module/:module ──────────────────────────
export const updateByModule = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const mod = (req.params.module || '').toLowerCase();
    if (!mod) return sendError(res, 'module requis', 400);
    const body = req.body || {};
    const params = Array.isArray(body) ? body : (Array.isArray(body.params) ? body.params : null);
    if (!params) return sendError(res, 'params (array) requis', 400);
    const result = await _bulkUpsert(params, [`${mod}.`]);
    return sendSuccess(res, { ...result, module: mod, total: params.length }, 'Paramètres module mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateByModule');
  }
};

// ─── GET /api/parametrage/:id ─────────────────────────────────────
export const getParametrageById = async (req, res) => {
  try {
    const pk = await getPkColumn();
    const r = await pool.query(
      `SELECT ${pk} AS id, cle, valeur, type_valeur, categorie, editable_ui,
              date_creation, date_modification
       FROM parametrage WHERE ${pk} = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Paramètre introuvable', 404);
    return sendSuccess(res, castValue(r.rows[0]));
  } catch (error) {
    return handleError(res, error, 'getParametrageById');
  }
};

// ─── POST /api/parametrage ────────────────────────────────────────
export const createParametrage = async (req, res) => {
  try {
    const { cle, valeur, type_valeur, categorie, editable_ui } = req.body || {};
    if (!cle) return sendError(res, 'cle requise', 400);
    const dup = await pool.query(`SELECT 1 FROM parametrage WHERE cle = $1 LIMIT 1`, [cle]);
    if (dup.rows[0]) return sendError(res, 'Clé déjà existante', 409);
    const pk = await getPkColumn();
    const r = await pool.query(
      `INSERT INTO parametrage (cle, valeur, type_valeur, categorie, editable_ui, date_creation)
       VALUES ($1,$2,$3,$4,$5,NOW())
       RETURNING ${pk} AS id, cle, valeur, type_valeur, categorie, editable_ui`,
      [cle, valeur ?? null, type_valeur || 'string', categorie || null, editable_ui ?? true]
    );
    return sendSuccess(res, r.rows[0], 'Paramètre créé', 201);
  } catch (error) {
    return handleError(res, error, 'createParametrage');
  }
};

// ─── PUT /api/parametrage/:id ─────────────────────────────────────
export const updateParametrage = async (req, res) => {
  try {
    const pk = await getPkColumn();
    const { valeur, type_valeur, categorie, editable_ui } = req.body || {};
    const r = await pool.query(
      `UPDATE parametrage
         SET valeur = COALESCE($1, valeur),
             type_valeur = COALESCE($2, type_valeur),
             categorie = COALESCE($3, categorie),
             editable_ui = COALESCE($4, editable_ui),
             date_modification = NOW()
       WHERE ${pk} = $5
       RETURNING ${pk} AS id, cle, valeur, type_valeur, categorie, editable_ui`,
      [valeur ?? null, type_valeur || null, categorie || null, editable_ui ?? null, req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Paramètre introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Paramètre mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateParametrage');
  }
};

// ─── DELETE /api/parametrage/:id ──────────────────────────────────
export const deleteParametrage = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const pk = await getPkColumn();
    const r = await pool.query(
      `DELETE FROM parametrage WHERE ${pk} = $1 RETURNING ${pk} AS id`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Paramètre introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id }, 'Paramètre supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteParametrage');
  }
};
