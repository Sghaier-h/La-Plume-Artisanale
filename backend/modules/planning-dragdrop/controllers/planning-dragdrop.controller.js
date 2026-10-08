/**
 * Contrôleur Planning Drag-and-Drop — planning_machines
 *
 * Endpoints :
 *   GET    /api/planning-dragdrop                          — Liste (filtres)
 *   GET    /api/planning-dragdrop/stats/charge             — Charge par machine
 *   GET    /api/planning-dragdrop/machine/:id              — Planning d'une machine
 *   POST   /api/planning-dragdrop/assigner                 — Assigner un OF
 *   POST   /api/planning-dragdrop/reordonner               — Réordonner en séquence
 *   PUT    /api/planning-dragdrop/:id/reordonner           — Nouvelles dates
 *   PUT    /api/planning-dragdrop/:id/demarrer             — statut = en_cours
 *   PUT    /api/planning-dragdrop/:id/terminer             — statut = termine
 *   DELETE /api/planning-dragdrop/:id
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

const PM_SELECT = `
  SELECT
    pm.*,
    pm.id_planning        AS id,
    of_.numero_of         AS of_numero,
    of_.quantite_a_produire,
    of_.priorite          AS of_priorite,
    a.designation         AS article_designation,
    m.numero_machine      AS machine_numero,
    m.marque              AS machine_marque,
    e.nom                 AS operateur_nom,
    e.prenom              AS operateur_prenom,
    e.fonction            AS operateur_fonction
  FROM planning_machines pm
  LEFT JOIN ordres_fabrication of_ ON pm.id_of        = of_.id_of
  LEFT JOIN articles_catalogue a   ON of_.id_article  = a.id_article
  LEFT JOIN machines m             ON pm.id_machine   = m.id_machine
  LEFT JOIN equipe_fabrication e   ON pm.id_operateur = e.id_operateur
`;

// ─── GET /api/planning-dragdrop ──────────────────────────────────
export const getPlanning = async (req, res) => {
  try {
    const { id_machine, statut, date_debut, date_fin } = req.query;
    const params = [];
    const where = [];
    if (id_machine) { params.push(id_machine); where.push(`pm.id_machine = $${params.length}`); }
    if (statut)     { params.push(statut);     where.push(`pm.statut     = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`pm.date_debut_prevue >= $${params.length}`); }
    if (date_fin)   { params.push(date_fin);   where.push(`pm.date_fin_prevue   <= $${params.length}`); }

    const sql = `
      ${PM_SELECT}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY pm.date_debut_prevue ASC NULLS LAST
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getPlanning');
  }
};

// ─── GET /api/planning-dragdrop/machine/:id_machine ──────────────
export const getPlanningByMachine = async (req, res) => {
  try {
    const r = await pool.query(
      `${PM_SELECT} WHERE pm.id_machine = $1 ORDER BY pm.date_debut_prevue ASC NULLS LAST`,
      [req.params.id_machine]
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getPlanningByMachine');
  }
};

// ─── GET /api/planning-dragdrop/stats/charge ─────────────────────
export const getChargeStats = async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        m.id_machine,
        m.numero_machine,
        COALESCE(SUM(EXTRACT(EPOCH FROM (pm.date_fin_prevue - pm.date_debut_prevue))/3600), 0)::numeric AS hours_planified,
        8 * 5 AS hours_capacity
      FROM machines m
      LEFT JOIN planning_machines pm
        ON pm.id_machine = m.id_machine
       AND pm.statut IN ('planifie','en_cours')
       AND pm.date_debut_prevue >= NOW() - INTERVAL '7 days'
      GROUP BY m.id_machine, m.numero_machine
      ORDER BY m.numero_machine
    `);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getChargeStats');
  }
};

// ─── POST /api/planning-dragdrop/assigner ────────────────────────
export const assignerOf = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const { id_of, id_machine, id_operateur, date_debut_prevue, date_fin_prevue, observations } = req.body || {};
    if (!id_of || !id_machine || !date_debut_prevue || !date_fin_prevue) {
      return sendError(res, 'id_of, id_machine, date_debut_prevue, date_fin_prevue requis', 400);
    }
    const r = await pool.query(
      `INSERT INTO planning_machines
         (id_machine, id_of, date_debut_prevue, date_fin_prevue, id_operateur, statut,
          observations, date_creation, created_by)
       VALUES ($1, $2, $3, $4, $5, 'planifie', $6, NOW(), $7)
       RETURNING *`,
      [id_machine, id_of, date_debut_prevue, date_fin_prevue, id_operateur || null,
       observations || null, userId]
    );

    try {
      const io = await getIo();
      if (io) io.emit('planning:updated', { id_machine });
    } catch {}

    return sendSuccess(res, r.rows[0], 'OF assigné', 201);
  } catch (error) {
    return handleError(res, error, 'assignerOf');
  }
};

// ─── PUT /api/planning-dragdrop/:id/reordonner ───────────────────
export const reordonnerUn = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const { new_date_debut_prevue, new_date_fin_prevue } = req.body || {};
    if (!new_date_debut_prevue || !new_date_fin_prevue) {
      return sendError(res, 'Nouvelles dates requises', 400);
    }
    const r = await pool.query(
      `UPDATE planning_machines
         SET date_debut_prevue = $1, date_fin_prevue = $2, updated_by = $3
       WHERE id_planning = $4 RETURNING *`,
      [new_date_debut_prevue, new_date_fin_prevue, userId, req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Planning introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('planning:updated', { id_machine: r.rows[0].id_machine });
    } catch {}

    return sendSuccess(res, r.rows[0], 'Planning réordonné');
  } catch (error) {
    return handleError(res, error, 'reordonnerUn');
  }
};

// ─── POST /api/planning-dragdrop/reordonner ──────────────────────
export const reordonnerBatch = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const { id_machine, ofIds } = req.body || {};
    if (!id_machine || !Array.isArray(ofIds) || !ofIds.length) {
      return sendError(res, 'id_machine et ofIds requis', 400);
    }

    // Récupérer durée moyenne courante
    const existing = await pool.query(
      `SELECT id_planning, id_of, date_debut_prevue, date_fin_prevue
       FROM planning_machines WHERE id_machine = $1 AND id_of = ANY($2::int[])`,
      [id_machine, ofIds]
    );
    const byOf = new Map(existing.rows.map(r => [r.id_of, r]));

    let cursor = new Date();
    const updated = [];
    for (const id_of of ofIds) {
      const row = byOf.get(id_of);
      if (!row) continue;
      const durationMs = row.date_fin_prevue && row.date_debut_prevue
        ? new Date(row.date_fin_prevue) - new Date(row.date_debut_prevue)
        : 60 * 60 * 1000;
      const debut = new Date(cursor);
      const fin   = new Date(cursor.getTime() + durationMs);
      const upd = await pool.query(
        `UPDATE planning_machines
           SET date_debut_prevue = $1, date_fin_prevue = $2, updated_by = $3
         WHERE id_planning = $4 RETURNING *`,
        [debut.toISOString(), fin.toISOString(), userId, row.id_planning]
      );
      updated.push(upd.rows[0]);
      cursor = fin;
    }

    try {
      const io = await getIo();
      if (io) io.emit('planning:updated', { id_machine });
    } catch {}

    return sendSuccess(res, { items: updated, total: updated.length }, 'Planning réordonné');
  } catch (error) {
    return handleError(res, error, 'reordonnerBatch');
  }
};

// ─── PUT /api/planning-dragdrop/:id/demarrer ─────────────────────
export const demarrer = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const r = await pool.query(
      `UPDATE planning_machines
         SET statut = 'en_cours', date_debut_reelle = NOW(), updated_by = $2
       WHERE id_planning = $1 RETURNING *`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Planning introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('planning:updated', { id_machine: r.rows[0].id_machine });
    } catch {}
    return sendSuccess(res, r.rows[0], 'Démarré');
  } catch (error) {
    return handleError(res, error, 'demarrer');
  }
};

// ─── PUT /api/planning-dragdrop/:id/terminer ─────────────────────
export const terminer = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const r = await pool.query(
      `UPDATE planning_machines
         SET statut = 'termine', date_fin_reelle = NOW(), updated_by = $2
       WHERE id_planning = $1 RETURNING *`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Planning introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('planning:updated', { id_machine: r.rows[0].id_machine });
    } catch {}
    return sendSuccess(res, r.rows[0], 'Terminé');
  } catch (error) {
    return handleError(res, error, 'terminer');
  }
};

// ─── DELETE /api/planning-dragdrop/:id ───────────────────────────
export const deletePlanning = async (req, res) => {
  try {
    const r = await pool.query(
      `DELETE FROM planning_machines WHERE id_planning = $1 RETURNING id_planning, id_machine`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Planning introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('planning:updated', { id_machine: r.rows[0].id_machine });
    } catch {}

    return sendSuccess(res, { id: r.rows[0].id_planning }, 'Planning supprimé');
  } catch (error) {
    return handleError(res, error, 'deletePlanning');
  }
};
