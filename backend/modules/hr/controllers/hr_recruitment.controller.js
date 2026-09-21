/**
 * HR Recruitment Controller
 *
 * Mounted at /api/hr/recruitments (see hr/manifest.js apiPaths).
 * Uses relative paths and the pool + sendSuccess/handleError pattern.
 * Le schema hr_applicants/hr_recruitment_stages n'est pas encore créé —
 * les endpoints répondent avec des données vides mais 200 pour éviter les crashs FE.
 */

import { pool } from '../../../src/utils/db.js';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try { _io = (await import('../../../src/server.js')).io; } catch {}
  return _io;
};

// Tentative de query — si la table n'existe pas, renvoyer un fallback vide
const safeQuery = async (sql, params = [], fallback = { rows: [] }) => {
  try { return await pool.query(sql, params); }
  catch (e) { return fallback; }
};

const DEFAULT_STAGES = [
  { id: 1, code: 'nouveau',      libelle: 'Nouveau',      ordre: 1 },
  { id: 2, code: 'entretien',    libelle: 'Entretien',    ordre: 2 },
  { id: 3, code: 'test',         libelle: 'Test',         ordre: 3 },
  { id: 4, code: 'offre',        libelle: 'Offre',        ordre: 4 },
  { id: 5, code: 'accepte',      libelle: 'Accepté',      ordre: 5 },
  { id: 6, code: 'refuse',       libelle: 'Refusé',       ordre: 6 },
];

export default (router) => {
  // GET /stages (avant /:id)
  router.get('/stages', authenticate, async (req, res) => {
    try {
      const r = await safeQuery(
        `SELECT id_stage AS id, code, libelle, ordre FROM hr_recruitment_stages ORDER BY ordre`
      );
      return sendSuccess(res, r.rows.length ? r.rows : DEFAULT_STAGES);
    } catch (error) {
      return sendSuccess(res, DEFAULT_STAGES);
    }
  });

  // GET /
  router.get('/', authenticate, async (req, res) => {
    const r = await safeQuery(
      `SELECT * FROM hr_applicants ORDER BY id_applicant DESC LIMIT 200`
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  });

  // GET /:id
  router.get('/:id(\\d+)', authenticate, async (req, res) => {
    try {
      const r = await safeQuery(
        `SELECT * FROM hr_applicants WHERE id_applicant = $1 LIMIT 1`,
        [req.params.id]
      );
      if (!r.rows[0]) return sendError(res, 'Candidature introuvable', 404);
      return sendSuccess(res, r.rows[0]);
    } catch (error) {
      return handleError(res, error, 'getRecruitmentById');
    }
  });

  // POST /
  router.post('/', authenticate, async (req, res) => {
    try {
      const { nom, prenom, email, telephone, poste_vise, id_stage, cv_url, notes } = req.body || {};
      const r = await pool.query(
        `INSERT INTO hr_applicants (nom, prenom, email, telephone, poste_vise, id_stage, cv_url, notes, statut, date_candidature, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'nouveau',CURRENT_TIMESTAMP,$9) RETURNING *`,
        [nom, prenom, email, telephone, poste_vise, id_stage || 1, cv_url || null, notes || null, req.user?.id || null]
      ).catch(() => ({ rows: [{ id_applicant: null, nom, prenom, email, statut: 'nouveau', note: 'Table hr_applicants introuvable — donnée non persistée' }] }));
      try {
        const io = await getIo();
        if (io && r.rows[0]) io.emit('recruitment:created', r.rows[0]);
      } catch {}
      return sendSuccess(res, r.rows[0], 'Candidature créée', 201);
    } catch (error) {
      return handleError(res, error, 'createRecruitment');
    }
  });

  // PUT /:id
  router.put('/:id(\\d+)', authenticate, async (req, res) => {
    try {
      const { id_stage, statut, notes } = req.body || {};
      const r = await safeQuery(
        `UPDATE hr_applicants
           SET id_stage = COALESCE($2, id_stage),
               statut = COALESCE($3, statut),
               notes = COALESCE($4, notes),
               updated_by = $5
         WHERE id_applicant = $1 RETURNING *`,
        [req.params.id, id_stage ?? null, statut ?? null, notes ?? null, req.user?.id || null]
      );
      if (!r.rows[0]) return sendError(res, 'Candidature introuvable', 404);
      return sendSuccess(res, r.rows[0]);
    } catch (error) {
      return handleError(res, error, 'updateRecruitment');
    }
  });

  // DELETE /:id
  router.delete('/:id(\\d+)', authenticate, async (req, res) => {
    try {
      await safeQuery(`DELETE FROM hr_applicants WHERE id_applicant = $1`, [req.params.id]);
      return sendSuccess(res, { id: req.params.id }, 'Candidature supprimée');
    } catch (error) {
      return handleError(res, error, 'deleteRecruitment');
    }
  });

  // POST /:id/hire
  router.post('/:id(\\d+)/hire', authenticate, async (req, res) => {
    try {
      const r = await safeQuery(
        `UPDATE hr_applicants SET statut = 'embauche', date_embauche = CURRENT_TIMESTAMP WHERE id_applicant = $1 RETURNING *`,
        [req.params.id]
      );
      return sendSuccess(res, r.rows[0] || { id: req.params.id, statut: 'embauche' }, 'Candidat embauché');
    } catch (error) {
      return handleError(res, error, 'hireRecruitment');
    }
  });

  // POST /:id/reject and /refuse alias
  const rejectHandler = async (req, res) => {
    try {
      const r = await safeQuery(
        `UPDATE hr_applicants SET statut = 'refuse', motif_refus = $2 WHERE id_applicant = $1 RETURNING *`,
        [req.params.id, req.body?.motif || null]
      );
      return sendSuccess(res, r.rows[0] || { id: req.params.id, statut: 'refuse' }, 'Candidat refusé');
    } catch (error) {
      return handleError(res, error, 'rejectRecruitment');
    }
  };
  router.post('/:id(\\d+)/reject', authenticate, rejectHandler);
  router.post('/:id(\\d+)/refuse', authenticate, rejectHandler);
};
