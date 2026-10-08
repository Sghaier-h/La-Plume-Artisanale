/**
 * Contrôleur Pointage — enregistrements de présence + résumés mensuels
 *
 * Table : pointage (id, timemoto_id, user_id, date, check_in, check_out,
 *                   heures_travaillees, present, retard_minutes, ...)
 * Join  : equipe_fabrication via user_id = id_operateur
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// Lazy import io pour éviter cycles
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};

const emit = async (event, payload) => {
  try {
    const io = await getIo();
    if (io) io.emit(event, payload);
  } catch {}
};

const BASE_SELECT = `
  SELECT
    p.id, p.timemoto_id, p.user_id, p.date, p.check_in, p.check_out,
    p.heures_travaillees, p.present, p.retard_minutes,
    p.created_at, p.updated_at, p.created_by, p.updated_by,
    e.nom AS operateur_nom, e.prenom AS operateur_prenom, e.matricule AS operateur_matricule
  FROM pointage p
  LEFT JOIN equipe_fabrication e ON p.user_id = e.id_operateur
`;

// ─── GET /api/pointage ────────────────────────────────────────────
export const getPointage = async (req, res) => {
  try {
    const { user_id, date_debut, date_fin, present } = req.query;
    const params = [];
    const where = [];

    if (user_id) {
      params.push(user_id);
      where.push(`p.user_id = $${params.length}`);
    }
    if (date_debut) {
      params.push(date_debut);
      where.push(`p.date >= $${params.length}`);
    }
    if (date_fin) {
      params.push(date_fin);
      where.push(`p.date <= $${params.length}`);
    }
    if (present === 'true' || present === true) where.push('p.present = true');
    else if (present === 'false' || present === false) where.push('p.present = false');

    const sql =
      BASE_SELECT +
      (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
      ` ORDER BY p.date DESC, p.check_in DESC`;

    const r = await pool.query(sql, params);
    return sendSuccess(res, r.rows, 'Pointages récupérés');
  } catch (error) {
    return handleError(res, error, 'getPointage');
  }
};

// ─── GET /api/pointage/stats/global ───────────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN present = true THEN 1 ELSE 0 END), 0)::int  AS presents_today,
        COALESCE(SUM(CASE WHEN present = false OR present IS NULL THEN 1 ELSE 0 END), 0)::int AS absents_today,
        COALESCE(SUM(CASE WHEN COALESCE(retard_minutes,0) > 0 THEN 1 ELSE 0 END), 0)::int AS retards_today,
        COALESCE(SUM(heures_travaillees), 0)::numeric AS heures_travaillees_today,
        COALESCE(AVG(NULLIF(retard_minutes,0)), 0)::numeric AS moyenne_retard_min
      FROM pointage
      WHERE date = CURRENT_DATE
    `);
    return sendSuccess(res, r.rows[0], 'Stats globales pointage');
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/pointage/user/:user_id/today ────────────────────────
export const getPointageUserToday = async (req, res) => {
  try {
    const { user_id } = req.params;
    const sql = BASE_SELECT + ` WHERE p.user_id = $1 AND p.date = CURRENT_DATE ORDER BY p.check_in DESC LIMIT 1`;
    const r = await pool.query(sql, [user_id]);
    return sendSuccess(res, r.rows[0] || null, "Pointage du jour récupéré");
  } catch (error) {
    return handleError(res, error, 'getPointageUserToday');
  }
};

// ─── GET /api/pointage/user/:user_id/month/:mois ──────────────────
export const getPointageUserMonth = async (req, res) => {
  try {
    const { user_id, mois } = req.params;
    if (!/^\d{4}-\d{2}$/.test(mois)) return sendError(res, "Format mois attendu YYYY-MM", 400);

    const sql =
      BASE_SELECT +
      ` WHERE p.user_id = $1 AND to_char(p.date, 'YYYY-MM') = $2 ORDER BY p.date ASC`;
    const r = await pool.query(sql, [user_id, mois]);

    const totals = r.rows.reduce(
      (acc, row) => {
        acc.total_heures += Number(row.heures_travaillees || 0);
        if (row.present) acc.total_jours_presents += 1;
        else acc.total_jours_absents += 1;
        if (Number(row.retard_minutes) > 0) {
          acc.total_retards += 1;
          acc.total_minutes_retard += Number(row.retard_minutes);
        }
        return acc;
      },
      { total_heures: 0, total_jours_presents: 0, total_jours_absents: 0, total_retards: 0, total_minutes_retard: 0 }
    );

    return sendSuccess(res, { rows: r.rows, totals }, 'Pointages du mois récupérés');
  } catch (error) {
    return handleError(res, error, 'getPointageUserMonth');
  }
};

// ─── GET /api/pointage/:id ────────────────────────────────────────
export const getPointageById = async (req, res) => {
  try {
    const r = await pool.query(BASE_SELECT + ` WHERE p.id = $1 LIMIT 1`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Pointage non trouvé', 404);
    return sendSuccess(res, r.rows[0], 'Pointage récupéré');
  } catch (error) {
    return handleError(res, error, 'getPointageById');
  }
};

const computeHours = (check_in, check_out) => {
  if (!check_in || !check_out) return null;
  const a = new Date(check_in).getTime();
  const b = new Date(check_out).getTime();
  if (isNaN(a) || isNaN(b) || b <= a) return null;
  return Math.round(((b - a) / 3600000) * 100) / 100;
};

// ─── POST /api/pointage ───────────────────────────────────────────
export const createPointage = async (req, res) => {
  try {
    const userId = getUserId(req) || null;
    const { user_id, date, check_in, check_out, retard_minutes, timemoto_id, present } = req.body || {};

    if (!user_id) return sendError(res, 'user_id requis', 400);

    const heures = computeHours(check_in, check_out);
    const presentVal = present !== undefined ? !!present : !!check_in;

    const r = await pool.query(
      `INSERT INTO pointage
        (user_id, date, check_in, check_out, heures_travaillees, present, retard_minutes, timemoto_id, created_at, created_by)
       VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7, $8, NOW(), $9)
       RETURNING *`,
      [user_id, date || null, check_in || null, check_out || null, heures, presentVal, retard_minutes ?? 0, timemoto_id || null, userId]
    );
    await emit('pointage:updated', r.rows[0]);
    return sendSuccess(res, r.rows[0], 'Pointage créé', 201);
  } catch (error) {
    return handleError(res, error, 'createPointage');
  }
};

// ─── PUT /api/pointage/:id ────────────────────────────────────────
export const updatePointage = async (req, res) => {
  try {
    const userId = getUserId(req) || null;
    const { id } = req.params;
    const excluded = ['id', 'created_at', 'created_by'];
    const data = req.body || {};
    const fields = Object.keys(data).filter((f) => !excluded.includes(f));
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);

    const values = fields.map((f) => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const sql = `UPDATE pointage SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
                 WHERE id = $${values.length + 2} RETURNING *`;
    const r = await pool.query(sql, [...values, userId, id]);
    if (!r.rows[0]) return sendError(res, 'Pointage non trouvé', 404);

    // Recompute heures if both check_in/check_out present
    const row = r.rows[0];
    if (row.check_in && row.check_out) {
      const h = computeHours(row.check_in, row.check_out);
      if (h !== null && Number(row.heures_travaillees) !== h) {
        const u = await pool.query(
          `UPDATE pointage SET heures_travaillees = $1 WHERE id = $2 RETURNING *`,
          [h, id]
        );
        return sendSuccess(res, u.rows[0], 'Pointage mis à jour');
      }
    }
    return sendSuccess(res, r.rows[0], 'Pointage mis à jour');
  } catch (error) {
    return handleError(res, error, 'updatePointage');
  }
};

// ─── PUT /api/pointage/:id/check-in ───────────────────────────────
export const setCheckIn = async (req, res) => {
  try {
    const userId = getUserId(req) || null;
    const r = await pool.query(
      `UPDATE pointage
         SET check_in = NOW(), present = true, updated_at = NOW(), updated_by = $2
       WHERE id = $1 RETURNING *`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Pointage non trouvé', 404);
    await emit('pointage:updated', r.rows[0]);
    return sendSuccess(res, r.rows[0], 'Check-in enregistré');
  } catch (error) {
    return handleError(res, error, 'setCheckIn');
  }
};

// ─── PUT /api/pointage/:id/check-out ──────────────────────────────
export const setCheckOut = async (req, res) => {
  try {
    const userId = getUserId(req) || null;
    const r = await pool.query(
      `UPDATE pointage
         SET check_out = NOW(),
             heures_travaillees = CASE
               WHEN check_in IS NOT NULL
                 THEN ROUND(EXTRACT(EPOCH FROM (NOW() - check_in))::numeric / 3600.0, 2)
               ELSE heures_travaillees END,
             updated_at = NOW(), updated_by = $2
       WHERE id = $1 RETURNING *`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Pointage non trouvé', 404);
    await emit('pointage:updated', r.rows[0]);
    return sendSuccess(res, r.rows[0], 'Check-out enregistré');
  } catch (error) {
    return handleError(res, error, 'setCheckOut');
  }
};

// ─── POST /api/pointage/check-in ──────────────────────────────────
export const quickCheckIn = async (req, res) => {
  try {
    const userId = getUserId(req) || null;
    const { user_id, retard_minutes } = req.body || {};
    if (!user_id) return sendError(res, 'user_id requis', 400);

    const r = await pool.query(
      `INSERT INTO pointage (user_id, date, check_in, present, retard_minutes, created_at, created_by)
       VALUES ($1, CURRENT_DATE, NOW(), true, $2, NOW(), $3)
       RETURNING *`,
      [user_id, retard_minutes ?? 0, userId]
    );
    await emit('pointage:updated', r.rows[0]);
    return sendSuccess(res, r.rows[0], 'Check-in rapide enregistré', 201);
  } catch (error) {
    return handleError(res, error, 'quickCheckIn');
  }
};

// ─── POST /api/pointage/check-out ─────────────────────────────────
export const quickCheckOut = async (req, res) => {
  try {
    const userId = getUserId(req) || null;
    const { user_id } = req.body || {};
    if (!user_id) return sendError(res, 'user_id requis', 400);

    const r = await pool.query(
      `UPDATE pointage
         SET check_out = NOW(),
             heures_travaillees = CASE
               WHEN check_in IS NOT NULL
                 THEN ROUND(EXTRACT(EPOCH FROM (NOW() - check_in))::numeric / 3600.0, 2)
               ELSE heures_travaillees END,
             updated_at = NOW(), updated_by = $2
       WHERE user_id = $1 AND date = CURRENT_DATE
       RETURNING *`,
      [user_id, userId]
    );
    if (!r.rows[0]) return sendError(res, "Aucun pointage aujourd'hui pour cet utilisateur", 404);
    await emit('pointage:updated', r.rows[0]);
    return sendSuccess(res, r.rows[0], 'Check-out rapide enregistré');
  } catch (error) {
    return handleError(res, error, 'quickCheckOut');
  }
};

// ─── DELETE /api/pointage/:id ─────────────────────────────────────
export const deletePointage = async (req, res) => {
  try {
    const r = await pool.query(`DELETE FROM pointage WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Pointage non trouvé', 404);
    return sendSuccess(res, { id: r.rows[0].id }, 'Pointage supprimé');
  } catch (error) {
    return handleError(res, error, 'deletePointage');
  }
};
