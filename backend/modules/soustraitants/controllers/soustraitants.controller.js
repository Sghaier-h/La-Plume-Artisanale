/**
 * Contrôleur Sous-traitants — La Plume Artisanale
 *
 * Bridge vers `mouvements_sous_traitance` + `mouvements_st_detail`.
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

const pad3 = (n) => String(n).padStart(3, '0');
const ymd = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
};
const nextNumero = async () => {
  const r = await pool.query(
    `SELECT COUNT(*)::int AS c FROM mouvements_sous_traitance WHERE DATE(date_mouvement) = CURRENT_DATE`
  );
  return `ST-${ymd()}-${pad3((r.rows[0].c || 0) + 1)}`;
};

const BASE_SELECT = `
  SELECT
    mst.*,
    mst.id_mouvement_st AS id,
    of_.numero_of,
    e.prenom || ' ' || e.nom AS execute_par_nom
  FROM mouvements_sous_traitance mst
  LEFT JOIN ordres_fabrication of_ ON mst.id_of = of_.id_of
  LEFT JOIN equipe_fabrication e   ON mst.execute_par = e.id_operateur
`;

export const getSoustraitants = async (req, res) => {
  try {
    const { statut, type_mouvement, id_sous_traitant, id_of, en_retard, limit = 200 } = req.query;
    const params = [];
    const where = [];
    if (statut)           { params.push(statut);           where.push(`mst.statut = $${params.length}`); }
    if (type_mouvement)   { params.push(type_mouvement);   where.push(`mst.type_mouvement = $${params.length}`); }
    if (id_sous_traitant) { params.push(id_sous_traitant); where.push(`mst.id_sous_traitant = $${params.length}`); }
    if (id_of)            { params.push(id_of);            where.push(`mst.id_of = $${params.length}`); }
    if (en_retard === 'true' || en_retard === true) {
      where.push(`mst.date_retour_prevue < NOW() AND mst.date_retour_reelle IS NULL`);
    }
    params.push(parseInt(limit, 10) || 200);
    const sql = `
      ${BASE_SELECT}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY mst.date_mouvement DESC NULLS LAST, mst.id_mouvement_st DESC
      LIMIT $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getSoustraitants');
  }
};

export const getSoustraitantById = async (req, res) => {
  try {
    const head = await pool.query(`${BASE_SELECT} WHERE mst.id_mouvement_st = $1 LIMIT 1`, [req.params.id]);
    if (!head.rows[0]) return sendError(res, 'Mouvement introuvable', 404);
    const det = await pool.query(
      `SELECT d.*, d.id_detail_st AS id
         FROM mouvements_st_detail d
        WHERE d.id_mouvement_st = $1
        ORDER BY d.id_detail_st ASC`,
      [req.params.id]
    );
    return sendSuccess(res, { ...head.rows[0], details: det.rows });
  } catch (error) {
    return handleError(res, error, 'getSoustraitantById');
  }
};

export const createSoustraitant = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = authorId(req);
    const {
      id_sous_traitant, id_of, type_mouvement,
      date_retour_prevue, observations, details = [],
    } = req.body || {};
    if (!id_sous_traitant || !type_mouvement) {
      return sendError(res, 'id_sous_traitant et type_mouvement requis', 400);
    }
    const numero = await nextNumero();
    await client.query('BEGIN');
    const head = await client.query(
      `INSERT INTO mouvements_sous_traitance (
         numero_mouvement, id_sous_traitant, id_of, type_mouvement,
         date_mouvement, date_retour_prevue, statut, observations,
         execute_par, created_by
       ) VALUES ($1, $2, $3, $4, NOW(), $5, 'en_cours', $6, $7, $7)
       RETURNING *, id_mouvement_st AS id`,
      [numero, id_sous_traitant, id_of || null, type_mouvement,
       date_retour_prevue || null, observations || null, userId]
    );
    const row = head.rows[0];
    const insertedDetails = [];
    for (const d of details) {
      const dr = await client.query(
        `INSERT INTO mouvements_st_detail (
           id_mouvement_st, id_lot_coupe, quantite_envoyee, observations, created_by
         ) VALUES ($1, $2, $3, $4, $5)
         RETURNING *, id_detail_st AS id`,
        [row.id_mouvement_st, d.id_lot_coupe || null, d.quantite_envoyee ?? 0,
         d.observations || null, userId]
      );
      insertedDetails.push(dr.rows[0]);
    }
    await client.query('COMMIT');
    const full = { ...row, details: insertedDetails };
    try {
      const io = await getIo();
      if (io) io.emit('soustraitants:new', full);
    } catch {}
    return sendSuccess(res, full, 'Mouvement créé', 201);
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return handleError(res, error, 'createSoustraitant');
  } finally {
    client.release();
  }
};

export const updateSoustraitant = async (req, res) => {
  try {
    const userId = authorId(req);
    const data = req.body || {};
    const excluded = ['id_mouvement_st', 'id', 'numero_mouvement', 'date_mouvement',
                      'created_by', 'details'];
    const fields = Object.keys(data).filter((f) => !excluded.includes(f));
    if (!fields.length) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => data[f]);
    values.push(userId, req.params.id);
    const r = await pool.query(
      `UPDATE mouvements_sous_traitance SET ${set}, updated_by = $${values.length - 1}
       WHERE id_mouvement_st = $${values.length}
       RETURNING *, id_mouvement_st AS id`,
      values
    );
    if (!r.rows[0]) return sendError(res, 'Mouvement introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Mouvement mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateSoustraitant');
  }
};

export const retourSoustraitant = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = authorId(req);
    const { details = [] } = req.body || {};
    await client.query('BEGIN');
    for (const d of details) {
      if (!d.id_detail_st) continue;
      await client.query(
        `UPDATE mouvements_st_detail
           SET quantite_retournee     = COALESCE($2, quantite_retournee),
               quantite_conforme      = COALESCE($3, quantite_conforme),
               quantite_non_conforme  = COALESCE($4, quantite_non_conforme),
               observations           = COALESCE($5, observations),
               updated_by             = $6
         WHERE id_detail_st = $1 AND id_mouvement_st = $7`,
        [d.id_detail_st, d.quantite_retournee ?? null, d.quantite_conforme ?? null,
         d.quantite_non_conforme ?? null, d.observations ?? null, userId, req.params.id]
      );
    }
    const head = await client.query(
      `UPDATE mouvements_sous_traitance
         SET statut = 'retourne', date_retour_reelle = NOW(), updated_by = $2
       WHERE id_mouvement_st = $1
       RETURNING *, id_mouvement_st AS id`,
      [req.params.id, userId]
    );
    await client.query('COMMIT');
    if (!head.rows[0]) return sendError(res, 'Mouvement introuvable', 404);
    const det = await pool.query(
      `SELECT *, id_detail_st AS id FROM mouvements_st_detail
        WHERE id_mouvement_st = $1 ORDER BY id_detail_st ASC`,
      [req.params.id]
    );
    const full = { ...head.rows[0], details: det.rows };
    try {
      const io = await getIo();
      if (io) io.emit('soustraitants:retour', full);
    } catch {}
    return sendSuccess(res, full, 'Retour enregistré');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return handleError(res, error, 'retourSoustraitant');
  } finally {
    client.release();
  }
};

export const annulerSoustraitant = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE mouvements_sous_traitance SET statut = 'annule', updated_by = $2
       WHERE id_mouvement_st = $1 RETURNING *, id_mouvement_st AS id`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Mouvement introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit('soustraitants:cancelled', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Mouvement annulé');
  } catch (error) {
    return handleError(res, error, 'annulerSoustraitant');
  }
};

export const deleteSoustraitant = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM mouvements_st_detail WHERE id_mouvement_st = $1`, [req.params.id]);
    const r = await client.query(
      `DELETE FROM mouvements_sous_traitance WHERE id_mouvement_st = $1 RETURNING id_mouvement_st`,
      [req.params.id]
    );
    await client.query('COMMIT');
    if (!r.rows[0]) return sendError(res, 'Mouvement introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_mouvement_st }, 'Mouvement supprimé');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    return handleError(res, error, 'deleteSoustraitant');
  } finally {
    client.release();
  }
};

export const getStatsGlobal = async (_req, res) => {
  try {
    const r = await pool.query(`
      WITH agg AS (
        SELECT
          COUNT(*)::int                                                           AS total,
          COUNT(*) FILTER (WHERE statut = 'en_cours')::int                       AS en_cours,
          COUNT(*) FILTER (WHERE statut = 'retourne')::int                       AS retournes,
          COUNT(*) FILTER (WHERE date_retour_prevue < NOW()
                             AND date_retour_reelle IS NULL
                             AND statut = 'en_cours')::int                       AS en_retard
        FROM mouvements_sous_traitance
      ),
      conf AS (
        SELECT
          COALESCE(SUM(quantite_conforme), 0)::numeric                            AS conforme,
          COALESCE(SUM(quantite_conforme + quantite_non_conforme), 0)::numeric    AS retour_total
        FROM mouvements_st_detail
      )
      SELECT
        agg.*,
        CASE WHEN conf.retour_total > 0
             THEN ROUND(100.0 * conf.conforme / conf.retour_total, 2)
             ELSE 0 END AS taux_conformite
      FROM agg, conf
    `);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── Rétro-compat CRUD ─────────────────────────────────────────────
export const getSoustraitants_alias = getSoustraitants;
