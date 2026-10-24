/**
 * Contrôleur Maintenance — La Plume Artisanale
 *
 * Bridge vers la table réelle `demandes_intervention`.
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
    `SELECT COUNT(*)::int AS c FROM demandes_intervention WHERE DATE(date_demande) = CURRENT_DATE`
  );
  return `MAINT-${ymd()}-${pad3((r.rows[0].c || 0) + 1)}`;
};

const BASE_SELECT = `
  SELECT
    di.*,
    di.id_demande AS id,
    m.numero_machine,
    demandeur.prenom || ' ' || demandeur.nom AS demande_par_nom,
    assignee.prenom  || ' ' || assignee.nom  AS assigne_a_nom
  FROM demandes_intervention di
  LEFT JOIN machines m               ON di.id_machine = m.id_machine
  LEFT JOIN equipe_fabrication demandeur ON di.demande_par = demandeur.id_operateur
  LEFT JOIN equipe_fabrication assignee  ON di.assigne_a   = assignee.id_operateur
`;

// ─── GET /api/maintenance ─────────────────────────────────────────
export const getMaintenance = async (req, res) => {
  try {
    const { statut, priorite, id_machine, type_intervention,
            date_debut, date_fin, limit = 200 } = req.query;
    const params = [];
    const where = [];
    if (statut)            { params.push(statut);            where.push(`di.statut = $${params.length}`); }
    if (priorite)          { params.push(priorite);          where.push(`di.priorite = $${params.length}`); }
    if (id_machine)        { params.push(id_machine);        where.push(`di.id_machine = $${params.length}`); }
    if (type_intervention) { params.push(type_intervention); where.push(`di.type_intervention = $${params.length}`); }
    if (date_debut)        { params.push(date_debut);        where.push(`di.date_demande >= $${params.length}`); }
    if (date_fin)          { params.push(date_fin);          where.push(`di.date_demande <= $${params.length}`); }
    params.push(parseInt(limit, 10) || 200);
    const sql = `
      ${BASE_SELECT}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY di.date_demande DESC NULLS LAST, di.id_demande DESC
      LIMIT $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getMaintenance');
  }
};

export const getMaintenanceById = async (req, res) => {
  try {
    const r = await pool.query(`${BASE_SELECT} WHERE di.id_demande = $1 LIMIT 1`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Demande introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getMaintenanceById');
  }
};

export const createMaintenance = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id_machine, type_intervention, priorite, description, assigne_a } = req.body || {};
    if (!id_machine || !type_intervention) {
      return sendError(res, 'id_machine et type_intervention requis', 400);
    }
    const numero = await nextNumero();
    const r = await pool.query(
      `INSERT INTO demandes_intervention (
         numero_demande, date_demande, id_machine, type_intervention,
         priorite, description, demande_par, assigne_a, statut, created_by
       ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, 'en_attente', $6)
       RETURNING *, id_demande AS id`,
      [numero, id_machine, type_intervention, priorite || 'normale',
       description || null, userId, assigne_a || null]
    );
    const row = r.rows[0];
    try {
      const io = await getIo();
      if (io) {
        io.emit('maintenance:new', row);
        if (row.assigne_a) io.to(`user-${row.assigne_a}`).emit('maintenance:new', row);
      }
    } catch {}
    return sendSuccess(res, row, 'Demande créée', 201);
  } catch (error) {
    return handleError(res, error, 'createMaintenance');
  }
};

export const updateMaintenance = async (req, res) => {
  try {
    const userId = authorId(req);
    const data = req.body || {};
    const excluded = ['id_demande', 'id', 'numero_demande', 'date_demande', 'created_by'];
    const fields = Object.keys(data).filter((f) => !excluded.includes(f));
    if (!fields.length) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => data[f]);
    values.push(userId, req.params.id);
    const r = await pool.query(
      `UPDATE demandes_intervention SET ${set}, updated_by = $${values.length - 1}
       WHERE id_demande = $${values.length}
       RETURNING *, id_demande AS id`,
      values
    );
    if (!r.rows[0]) return sendError(res, 'Demande introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Demande mise à jour');
  } catch (error) {
    return handleError(res, error, 'updateMaintenance');
  }
};

export const assignerMaintenance = async (req, res) => {
  try {
    const userId = authorId(req);
    const { assigne_a } = req.body || {};
    if (!assigne_a) return sendError(res, 'assigne_a requis', 400);
    const r = await pool.query(
      `UPDATE demandes_intervention
         SET assigne_a = $2, updated_by = $3
       WHERE id_demande = $1
       RETURNING *, id_demande AS id`,
      [req.params.id, assigne_a, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Demande introuvable', 404);
    try {
      const io = await getIo();
      if (io) {
        io.to(`user-${assigne_a}`).emit('maintenance:assigned', r.rows[0]);
        io.emit('maintenance:assigned', r.rows[0]);
      }
    } catch {}
    return sendSuccess(res, r.rows[0], 'Demande assignée');
  } catch (error) {
    return handleError(res, error, 'assignerMaintenance');
  }
};

export const demarrerMaintenance = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE demandes_intervention
         SET statut = 'en_cours',
             date_debut_intervention = NOW(),
             temps_reponse = CASE
               WHEN date_demande IS NOT NULL
               THEN EXTRACT(EPOCH FROM (NOW() - date_demande)) / 60
               ELSE NULL END,
             updated_by = $2
       WHERE id_demande = $1
       RETURNING *, id_demande AS id`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Demande introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit('maintenance:started', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Intervention démarrée');
  } catch (error) {
    return handleError(res, error, 'demarrerMaintenance');
  }
};

export const terminerMaintenance = async (req, res) => {
  try {
    const userId = authorId(req);
    const { diagnostic, actions_effectuees, pieces_changees, cout_intervention } = req.body || {};
    const r = await pool.query(
      `UPDATE demandes_intervention
         SET statut = 'terminee',
             date_fin_intervention = NOW(),
             duree_intervention = CASE
               WHEN date_debut_intervention IS NOT NULL
               THEN EXTRACT(EPOCH FROM (NOW() - date_debut_intervention)) / 60
               ELSE NULL END,
             temps_resolution = CASE
               WHEN date_demande IS NOT NULL
               THEN EXTRACT(EPOCH FROM (NOW() - date_demande)) / 60
               ELSE NULL END,
             diagnostic = COALESCE($2, diagnostic),
             actions_effectuees = COALESCE($3, actions_effectuees),
             pieces_changees = COALESCE($4, pieces_changees),
             cout_intervention = COALESCE($5, cout_intervention),
             updated_by = $6
       WHERE id_demande = $1
       RETURNING *, id_demande AS id`,
      [req.params.id, diagnostic ?? null, actions_effectuees ?? null,
       pieces_changees ?? null, cout_intervention ?? null, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Demande introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit('maintenance:completed', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Intervention terminée');
  } catch (error) {
    return handleError(res, error, 'terminerMaintenance');
  }
};

export const cloturerMaintenance = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE demandes_intervention
         SET statut = 'cloturee', date_cloture = NOW(), updated_by = $2
       WHERE id_demande = $1
       RETURNING *, id_demande AS id`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Demande introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit('maintenance:closed', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Demande clôturée');
  } catch (error) {
    return handleError(res, error, 'cloturerMaintenance');
  }
};

export const annulerMaintenance = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE demandes_intervention SET statut = 'annulee', updated_by = $2
       WHERE id_demande = $1 RETURNING *, id_demande AS id`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Demande introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit('maintenance:cancelled', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Demande annulée');
  } catch (error) {
    return handleError(res, error, 'annulerMaintenance');
  }
};

export const deleteMaintenance = async (req, res) => {
  try {
    const r = await pool.query(
      `DELETE FROM demandes_intervention WHERE id_demande = $1 RETURNING id_demande`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Demande introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_demande }, 'Demande supprimée');
  } catch (error) {
    return handleError(res, error, 'deleteMaintenance');
  }
};

export const getHistoriqueMachine = async (req, res) => {
  try {
    const r = await pool.query(
      `${BASE_SELECT} WHERE di.id_machine = $1
       ORDER BY di.date_demande DESC NULLS LAST, di.id_demande DESC LIMIT 500`,
      [req.params.id_machine]
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getHistoriqueMachine');
  }
};

export const getStatsGlobal = async (_req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)::int                                                    AS total,
        COUNT(*) FILTER (WHERE statut = 'en_attente')::int              AS en_attente,
        COUNT(*) FILTER (WHERE statut = 'en_cours')::int                AS en_cours,
        COUNT(*) FILTER (WHERE statut IN ('terminee','cloturee'))::int  AS terminees,
        COALESCE(AVG(temps_reponse), 0)::numeric                        AS temps_reponse_moyen,
        COALESCE(SUM(COALESCE(cout_intervention, 0)), 0)::numeric       AS cout_total_periode
      FROM demandes_intervention
    `);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};
