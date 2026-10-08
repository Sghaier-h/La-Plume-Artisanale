/**
 * Contrôleur Settings — Préférences utilisateur (per-user)
 *
 * Endpoints:
 *   GET    /api/settings                  — Toutes les préférences (utilisateur courant)
 *   GET    /api/settings/defaults         — Valeurs par défaut
 *   POST   /api/settings/reset            — Réinitialise les préférences
 *   GET    /api/settings/user/:id_user    — Lecture admin d'un autre utilisateur
 *   GET    /api/settings/:cle             — Une préférence
 *   PUT    /api/settings/:cle             — Upsert
 *   DELETE /api/settings/:cle             — Supprimer
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const currentUserId = (req) => req.user?.id || req.user?.userId || null;
const isAdmin = (req) => req.user?.role === 'ADMIN';

const DEFAULTS = {
  'ui.theme': 'auto',
  'ui.language': 'fr',
  'dashboard.layout': 'default',
  'notifications.email': true,
  'notifications.whatsapp': false,
};

// Migration idempotente
(async () => {
  try {
    await pool.query(`
      ALTER TABLE settings
        ADD COLUMN IF NOT EXISTS id_utilisateur INTEGER,
        ADD COLUMN IF NOT EXISTS cle VARCHAR(200),
        ADD COLUMN IF NOT EXISTS valeur JSONB,
        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS date_modification TIMESTAMP
    `);
    try {
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_user_cle
        ON settings(id_utilisateur, cle) WHERE cle IS NOT NULL
      `);
    } catch {}
  } catch (err) {
    console.warn('[settings] migration ALTER TABLE échouée:', err.message);
  }
})();

let _pkColumnCache = null;
const getPkColumn = async () => {
  if (_pkColumnCache) return _pkColumnCache;
  const r = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name ILIKE 'id%'
      AND column_name <> 'id_utilisateur'
    ORDER BY ordinal_position LIMIT 1
  `);
  _pkColumnCache = r.rows[0]?.column_name || 'id';
  return _pkColumnCache;
};

// ─── GET /api/settings ────────────────────────────────────────────
export const getSettings = async (req, res) => {
  try {
    const uid = currentUserId(req);
    if (!uid) return sendError(res, 'Utilisateur non authentifié', 401);
    const r = await pool.query(
      `SELECT cle, valeur, category FROM settings WHERE id_utilisateur = $1 AND cle IS NOT NULL`,
      [uid]
    );
    const map = {};
    for (const row of r.rows) map[row.cle] = row.valeur;
    return sendSuccess(res, { settings: map, items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getSettings');
  }
};

// ─── GET /api/settings/defaults ───────────────────────────────────
export const getDefaults = async (req, res) => {
  return sendSuccess(res, { defaults: DEFAULTS });
};

// ─── POST /api/settings/reset ─────────────────────────────────────
export const resetSettings = async (req, res) => {
  try {
    const uid = currentUserId(req);
    if (!uid) return sendError(res, 'Utilisateur non authentifié', 401);
    const r = await pool.query(
      `DELETE FROM settings WHERE id_utilisateur = $1 RETURNING cle`,
      [uid]
    );
    return sendSuccess(res, { deleted: r.rows.length }, 'Préférences réinitialisées');
  } catch (error) {
    return handleError(res, error, 'resetSettings');
  }
};

// ─── GET /api/settings/user/:id_user ──────────────────────────────
export const getUserSettings = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const r = await pool.query(
      `SELECT cle, valeur, category FROM settings WHERE id_utilisateur = $1 AND cle IS NOT NULL`,
      [req.params.id_user]
    );
    const map = {};
    for (const row of r.rows) map[row.cle] = row.valeur;
    return sendSuccess(res, { id_utilisateur: req.params.id_user, settings: map, items: r.rows });
  } catch (error) {
    return handleError(res, error, 'getUserSettings');
  }
};

// ─── GET /api/settings/:cle ───────────────────────────────────────
export const getSettingByCle = async (req, res) => {
  try {
    const uid = currentUserId(req);
    if (!uid) return sendError(res, 'Utilisateur non authentifié', 401);
    const r = await pool.query(
      `SELECT cle, valeur, category FROM settings WHERE id_utilisateur = $1 AND cle = $2 LIMIT 1`,
      [uid, req.params.cle]
    );
    if (!r.rows[0]) {
      if (req.params.cle in DEFAULTS) {
        return sendSuccess(res, { cle: req.params.cle, valeur: DEFAULTS[req.params.cle], default: true });
      }
      return sendError(res, 'Préférence introuvable', 404);
    }
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getSettingByCle');
  }
};

// ─── PUT /api/settings/:cle ───────────────────────────────────────
export const upsertSetting = async (req, res) => {
  try {
    const uid = currentUserId(req);
    if (!uid) return sendError(res, 'Utilisateur non authentifié', 401);
    const { valeur, category } = req.body || {};
    if (valeur === undefined) return sendError(res, 'valeur requise', 400);

    const existing = await pool.query(
      `SELECT 1 FROM settings WHERE id_utilisateur = $1 AND cle = $2 LIMIT 1`,
      [uid, req.params.cle]
    );

    if (existing.rows[0]) {
      await pool.query(
        `UPDATE settings SET valeur = $1, category = COALESCE($2, category), date_modification = NOW()
         WHERE id_utilisateur = $3 AND cle = $4`,
        [JSON.stringify(valeur), category || null, uid, req.params.cle]
      );
    } else {
      await pool.query(
        `INSERT INTO settings (id_utilisateur, cle, valeur, category, date_creation)
         VALUES ($1, $2, $3, $4, NOW())`,
        [uid, req.params.cle, JSON.stringify(valeur), category || null]
      );
    }
    return sendSuccess(res, { cle: req.params.cle, valeur }, 'Préférence enregistrée');
  } catch (error) {
    return handleError(res, error, 'upsertSetting');
  }
};

// ─── DELETE /api/settings/:cle ────────────────────────────────────
export const deleteSetting = async (req, res) => {
  try {
    const uid = currentUserId(req);
    if (!uid) return sendError(res, 'Utilisateur non authentifié', 401);
    const r = await pool.query(
      `DELETE FROM settings WHERE id_utilisateur = $1 AND cle = $2 RETURNING cle`,
      [uid, req.params.cle]
    );
    if (!r.rows[0]) return sendError(res, 'Préférence introuvable', 404);
    return sendSuccess(res, { cle: r.rows[0].cle }, 'Préférence supprimée');
  } catch (error) {
    return handleError(res, error, 'deleteSetting');
  }
};
