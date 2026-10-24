/**
 * Contrôleur Taches — assignation opérateurs / suivi
 *
 * Endpoints :
 *   GET    /api/taches                          — Liste (filtres)
 *   GET    /api/taches/stats/global             — Statistiques globales
 *   GET    /api/taches/operateur/:id/day        — Tâches du jour + retard (tablette)
 *   GET    /api/taches/:id                      — Détail
 *   POST   /api/taches                          — Créer
 *   PUT    /api/taches/:id                      — Mise à jour
 *   PUT    /api/taches/:id/demarrer             — Démarrer
 *   PUT    /api/taches/:id/terminer             — Terminer
 *   PUT    /api/taches/:id/progression          — Mettre à jour progression
 *   DELETE /api/taches/:id                      — Supprimer (soft)
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

// Lazy import de io pour éviter les cycles
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

const T_SELECT = `
  SELECT
    t.*,
    t.id_taches AS id,
    of_.numero_of                    AS of_numero,
    e.nom                            AS operateur_nom,
    e.prenom                         AS operateur_prenom,
    e.fonction                       AS operateur_fonction
  FROM taches t
  LEFT JOIN ordres_fabrication of_ ON t.id_of        = of_.id_of
  LEFT JOIN equipe_fabrication e   ON t.id_operateur = e.id_operateur
`;

// ─── GET /api/taches ─────────────────────────────────────────────
export const getTaches = async (req, res) => {
  try {
    const { id_of, id_operateur, statut, priorite, poste, overdue } = req.query;
    const params = [];
    const where = ['(t.active IS NULL OR t.active = true)'];

    if (id_of)        { params.push(id_of);        where.push(`t.id_of        = $${params.length}`); }
    if (id_operateur) { params.push(id_operateur); where.push(`t.id_operateur = $${params.length}`); }
    if (statut)       { params.push(statut);       where.push(`t.statut       = $${params.length}`); }
    if (priorite)     { params.push(priorite);     where.push(`t.priorite     = $${params.length}`); }
    if (poste)        { params.push(poste);        where.push(`t.poste        = $${params.length}`); }

    if (overdue === 'true' || overdue === true) {
      where.push(`t.date_echeance < NOW() AND t.statut NOT IN ('termine','annule')`);
    }

    const sql = `
      ${T_SELECT}
      WHERE ${where.join(' AND ')}
      ORDER BY
        CASE t.priorite WHEN 'haute' THEN 1 WHEN 'normale' THEN 2 WHEN 'basse' THEN 3 ELSE 4 END,
        t.date_echeance ASC NULLS LAST,
        t.created_at DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getTaches');
  }
};

// ─── GET /api/taches/stats/global ────────────────────────────────
export const getTachesStats = async (req, res) => {
  try {
    const sql = `
      SELECT
        COUNT(*)::int                                                                          AS total,
        COUNT(*) FILTER (WHERE statut = 'en_attente')::int                                     AS en_attente,
        COUNT(*) FILTER (WHERE statut = 'en_cours')::int                                       AS en_cours,
        COUNT(*) FILTER (WHERE statut = 'termine')::int                                        AS terminees,
        COUNT(*) FILTER (WHERE date_echeance < NOW() AND statut != 'termine')::int             AS en_retard
      FROM taches
      WHERE (active IS NULL OR active = true)
    `;
    const r = await pool.query(sql);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getTachesStats');
  }
};

// ─── GET /api/taches/operateur/:id/day ───────────────────────────
export const getTachesOperateurDay = async (req, res) => {
  try {
    const idOp = parseInt(req.params.id_operateur, 10);
    if (!idOp) return sendError(res, 'Opérateur requis', 400);

    const sql = `
      ${T_SELECT}
      WHERE (t.active IS NULL OR t.active = true)
        AND t.id_operateur = $1
        AND (
          (t.date_echeance::date = CURRENT_DATE)
          OR (t.date_echeance < NOW() AND t.statut NOT IN ('termine','annule'))
          OR (t.statut = 'en_cours')
        )
      ORDER BY
        CASE WHEN t.statut = 'en_cours' THEN 0 ELSE 1 END,
        t.date_echeance ASC NULLS LAST
    `;
    const r = await pool.query(sql, [idOp]);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getTachesOperateurDay');
  }
};

// ─── GET /api/taches/:id ─────────────────────────────────────────
export const getTachesById = async (req, res) => {
  try {
    const r = await pool.query(`${T_SELECT} WHERE t.id_taches = $1 LIMIT 1`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Tâche introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getTachesById');
  }
};

// ─── POST /api/taches ────────────────────────────────────────────
export const createTaches = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const {
      titre, description, id_of, id_operateur, poste,
      priorite = 'normale', statut = 'en_attente', date_echeance, name,
    } = req.body || {};

    if (!titre && !name) return sendError(res, 'Titre requis', 400);

    const r = await pool.query(
      `INSERT INTO taches
         (name, titre, description, id_of, id_operateur, poste, priorite, statut,
          date_echeance, progression, active, created_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, true, NOW(), $10)
       RETURNING *`,
      [name || titre, titre || name, description || null, id_of || null, id_operateur || null,
       poste || null, priorite, statut, date_echeance || null, userId]
    );

    const row = r.rows[0];

    try {
      const io = await getIo();
      if (io && row.id_operateur) {
        io.to(`user-${row.id_operateur}`).emit('tache:new', row);
      }
    } catch {}

    return sendSuccess(res, row, 'Tâche créée', 201);
  } catch (error) {
    return handleError(res, error, 'createTaches');
  }
};

// ─── PUT /api/taches/:id ─────────────────────────────────────────
export const updateTaches = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const allowed = ['titre','description','id_of','id_operateur','poste','priorite','statut','date_echeance','progression','name'];
    const fields = Object.keys(req.body || {}).filter(k => allowed.includes(k));
    if (!fields.length) return sendError(res, 'Aucune donnée à mettre à jour', 400);

    const values = fields.map(f => req.body[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const r = await pool.query(
      `UPDATE taches SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
       WHERE id_taches = $${values.length + 2} RETURNING *`,
      [...values, userId, req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Tâche introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Tâche mise à jour');
  } catch (error) {
    return handleError(res, error, 'updateTaches');
  }
};

// ─── PUT /api/taches/:id/demarrer ────────────────────────────────
export const demarrerTache = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const r = await pool.query(
      `UPDATE taches SET statut = 'en_cours', date_debut = COALESCE(date_debut, NOW()),
         updated_at = NOW(), updated_by = $2
       WHERE id_taches = $1 RETURNING *`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Tâche introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('tache:started', r.rows[0]);
    } catch {}

    return sendSuccess(res, r.rows[0], 'Tâche démarrée');
  } catch (error) {
    return handleError(res, error, 'demarrerTache');
  }
};

// ─── PUT /api/taches/:id/terminer ────────────────────────────────
export const terminerTache = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const r = await pool.query(
      `UPDATE taches SET statut = 'termine', date_fin = NOW(), progression = 100,
         updated_at = NOW(), updated_by = $2
       WHERE id_taches = $1 RETURNING *`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Tâche introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('tache:completed', r.rows[0]);
    } catch {}

    return sendSuccess(res, r.rows[0], 'Tâche terminée');
  } catch (error) {
    return handleError(res, error, 'terminerTache');
  }
};

// ─── PUT /api/taches/:id/progression ─────────────────────────────
export const updateProgression = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const p = parseInt(req.body?.progression, 10);
    if (isNaN(p) || p < 0 || p > 100) return sendError(res, 'Progression 0-100 requise', 400);

    const r = await pool.query(
      `UPDATE taches SET progression = $2, updated_at = NOW(), updated_by = $3
       WHERE id_taches = $1 RETURNING *`,
      [req.params.id, p, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Tâche introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('tache:progress', { id: r.rows[0].id_taches, progression: p });
    } catch {}

    return sendSuccess(res, r.rows[0], 'Progression mise à jour');
  } catch (error) {
    return handleError(res, error, 'updateProgression');
  }
};

// ─── DELETE /api/taches/:id ──────────────────────────────────────
export const deleteTaches = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const r = await pool.query(
      `UPDATE taches SET active = false, updated_at = NOW(), updated_by = $2
       WHERE id_taches = $1 RETURNING id_taches`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Tâche introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_taches }, 'Tâche supprimée');
  } catch (error) {
    return handleError(res, error, 'deleteTaches');
  }
};
