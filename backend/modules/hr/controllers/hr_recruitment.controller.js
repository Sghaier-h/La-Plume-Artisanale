/**
 * HR Recruitment Controller
 *
 * Mounted at /api/hr/recruitments (see hr/manifest.js apiPaths).
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

const safeQuery = async (sql, params = [], fallback = { rows: [] }) => {
  try { return await pool.query(sql, params); }
  catch (e) { return fallback; }
};

const DEFAULT_STAGES = [
  { id: 1, code: 'nouveau',      libelle: 'Nouveau',      ordre: 1, couleur: '#4A5D75' },
  { id: 2, code: 'entretien',    libelle: 'Entretien',    ordre: 2, couleur: '#C89B3C' },
  { id: 3, code: 'test',         libelle: 'Test',         ordre: 3, couleur: '#7A8C6A' },
  { id: 4, code: 'offre',        libelle: 'Offre',        ordre: 4, couleur: '#B57B7B' },
  { id: 5, code: 'accepte',      libelle: 'Accepté',      ordre: 5, couleur: '#6B8E4E' },
  { id: 6, code: 'refuse',       libelle: 'Refusé',       ordre: 6, couleur: '#B84A2F' },
];

const logEvent = async (id_applicant, event_type, extra = {}, userId = null) => {
  try {
    await pool.query(
      `INSERT INTO hr_recruitment_timeline
       (id_applicant, event_type, from_stage, to_stage, interview_date, interview_type, interviewer, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        id_applicant, event_type,
        extra.from_stage || null, extra.to_stage || null,
        extra.interview_date || null, extra.interview_type || null,
        extra.interviewer || null, extra.notes || null,
        userId,
      ]
    );
  } catch {}
};

export default (router) => {
  // GET /stages
  router.get('/stages', authenticate, async (req, res) => {
    try {
      const r = await safeQuery(
        `SELECT id_stage AS id, code, libelle, ordre, couleur FROM hr_recruitment_stages ORDER BY ordre`
      );
      return sendSuccess(res, r.rows.length ? r.rows : DEFAULT_STAGES);
    } catch (error) {
      return sendSuccess(res, DEFAULT_STAGES);
    }
  });

  // GET /stats/global
  router.get('/stats/global', authenticate, async (req, res) => {
    try {
      const total = await safeQuery(`SELECT COUNT(*)::int AS n FROM hr_applicants`);
      const encours = await safeQuery(
        `SELECT COUNT(*)::int AS n FROM hr_applicants WHERE statut NOT IN ('accepte','refuse','embauche')`
      );
      const embauches = await safeQuery(
        `SELECT COUNT(*)::int AS n FROM hr_applicants WHERE statut IN ('accepte','embauche')`
      );
      const refuses = await safeQuery(
        `SELECT COUNT(*)::int AS n FROM hr_applicants WHERE statut = 'refuse'`
      );
      const tempsMoy = await safeQuery(
        `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (date_embauche - date_candidature))/86400),0)::numeric(10,1) AS jours
           FROM hr_applicants WHERE date_embauche IS NOT NULL`
      );
      const t = total.rows[0]?.n || 0;
      const e = embauches.rows[0]?.n || 0;
      return sendSuccess(res, {
        total_candidatures: t,
        en_cours: encours.rows[0]?.n || 0,
        embauches: e,
        refuses: refuses.rows[0]?.n || 0,
        taux_conversion: t > 0 ? Number(((e / t) * 100).toFixed(1)) : 0,
        temps_moyen_process: Number(tempsMoy.rows[0]?.jours || 0),
      });
    } catch (error) {
      return handleError(res, error, 'getRecruitmentStatsGlobal');
    }
  });

  // GET /funnel
  router.get('/funnel', authenticate, async (req, res) => {
    try {
      const days = Number(req.query.days) || 365;
      const r = await safeQuery(
        `SELECT s.id_stage, s.code AS stage_code, s.libelle AS stage_libelle, s.ordre,
                COUNT(a.id_applicant)::int AS count
           FROM hr_recruitment_stages s
           LEFT JOIN hr_applicants a
             ON a.id_stage = s.id_stage
            AND a.date_candidature >= NOW() - ($1 || ' days')::interval
          GROUP BY s.id_stage, s.code, s.libelle, s.ordre
          ORDER BY s.ordre`,
        [String(days)]
      );
      const rows = r.rows.length ? r.rows : DEFAULT_STAGES.map(s => ({
        id_stage: s.id, stage_code: s.code, stage_libelle: s.libelle, ordre: s.ordre, count: 0
      }));
      let prev = null;
      const enriched = rows.map((row) => {
        const dropoff = prev != null && prev > 0
          ? Number((((prev - row.count) / prev) * 100).toFixed(1))
          : 0;
        prev = row.count;
        return { ...row, dropoff_pct: dropoff };
      });
      return sendSuccess(res, enriched);
    } catch (error) {
      return handleError(res, error, 'getRecruitmentFunnel');
    }
  });

  // GET /postes
  router.get('/postes', authenticate, async (req, res) => {
    try {
      const r = await safeQuery(
        `SELECT poste_vise, COUNT(*)::int AS count
           FROM hr_applicants
          WHERE poste_vise IS NOT NULL AND poste_vise <> ''
          GROUP BY poste_vise
          ORDER BY count DESC
          LIMIT 20`
      );
      return sendSuccess(res, r.rows);
    } catch (error) {
      return handleError(res, error, 'getRecruitmentPostes');
    }
  });

  // GET /analytics/mensuel
  router.get('/analytics/mensuel', authenticate, async (req, res) => {
    try {
      const cand = await safeQuery(
        `SELECT to_char(date_trunc('month', date_candidature), 'YYYY-MM') AS mois,
                COUNT(*)::int AS candidatures,
                SUM(CASE WHEN statut IN ('accepte','embauche') THEN 1 ELSE 0 END)::int AS embauches
           FROM hr_applicants
          WHERE date_candidature >= NOW() - INTERVAL '12 months'
          GROUP BY 1 ORDER BY 1`
      );
      const rows = cand.rows.map(r => ({
        mois: r.mois,
        candidatures: r.candidatures,
        embauches: r.embauches,
        taux_conversion: r.candidatures > 0
          ? Number(((r.embauches / r.candidatures) * 100).toFixed(1))
          : 0,
      }));
      return sendSuccess(res, rows);
    } catch (error) {
      return handleError(res, error, 'getRecruitmentAnalyticsMensuel');
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

  // GET /:id/timeline
  router.get('/:id(\\d+)/timeline', authenticate, async (req, res) => {
    try {
      const r = await safeQuery(
        `SELECT t.*, sf.libelle AS from_stage_libelle, st.libelle AS to_stage_libelle
           FROM hr_recruitment_timeline t
           LEFT JOIN hr_recruitment_stages sf ON sf.id_stage = t.from_stage
           LEFT JOIN hr_recruitment_stages st ON st.id_stage = t.to_stage
          WHERE t.id_applicant = $1
          ORDER BY t.created_at DESC`,
        [req.params.id]
      );
      return sendSuccess(res, r.rows);
    } catch (error) {
      return handleError(res, error, 'getRecruitmentTimeline');
    }
  });

  // POST /:id/notes
  router.post('/:id(\\d+)/notes', authenticate, async (req, res) => {
    try {
      const { text, notes } = req.body || {};
      const noteText = text || notes || '';
      if (!noteText.trim()) return sendError(res, 'Note vide', 400);
      await logEvent(req.params.id, 'note', { notes: noteText }, req.user?.id || null);
      return sendSuccess(res, { ok: true }, 'Note ajoutée');
    } catch (error) {
      return handleError(res, error, 'addRecruitmentNote');
    }
  });

  // POST /:id/interview
  router.post('/:id(\\d+)/interview', authenticate, async (req, res) => {
    try {
      const { date, type, interviewer, notes } = req.body || {};
      await logEvent(req.params.id, 'interview', {
        interview_date: date || null,
        interview_type: type || null,
        interviewer: interviewer || null,
        notes: notes || null,
      }, req.user?.id || null);
      return sendSuccess(res, { ok: true }, 'Entretien planifié');
    } catch (error) {
      return handleError(res, error, 'scheduleRecruitmentInterview');
    }
  });

  // POST /
  router.post('/', authenticate, async (req, res) => {
    try {
      const {
        nom, prenom, email, telephone, poste_vise, id_stage, cv_url, notes,
        source_candidature, niveau_etudes, experience_annees, pretention_salariale,
        disponibilite, score_evaluation,
      } = req.body || {};
      const r = await pool.query(
        `INSERT INTO hr_applicants
          (nom, prenom, email, telephone, poste_vise, id_stage, cv_url, notes,
           source_candidature, niveau_etudes, experience_annees, pretention_salariale,
           disponibilite, score_evaluation, statut, date_candidature, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'nouveau',CURRENT_TIMESTAMP,$15)
         RETURNING *`,
        [nom, prenom, email, telephone, poste_vise, id_stage || 1, cv_url || null, notes || null,
         source_candidature || null, niveau_etudes || null, experience_annees || null,
         pretention_salariale || null, disponibilite || null, score_evaluation || null,
         req.user?.id || null]
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
      // Récupérer stage actuel pour logger le changement
      const prev = await safeQuery(
        `SELECT id_stage FROM hr_applicants WHERE id_applicant = $1`,
        [req.params.id]
      );
      const oldStage = prev.rows[0]?.id_stage || null;

      const {
        id_stage, statut, notes,
        source_candidature, niveau_etudes, experience_annees,
        pretention_salariale, disponibilite, score_evaluation,
        poste_vise, telephone, email,
      } = req.body || {};

      const r = await safeQuery(
        `UPDATE hr_applicants
           SET id_stage = COALESCE($2, id_stage),
               statut = COALESCE($3, statut),
               notes = COALESCE($4, notes),
               source_candidature = COALESCE($5, source_candidature),
               niveau_etudes = COALESCE($6, niveau_etudes),
               experience_annees = COALESCE($7, experience_annees),
               pretention_salariale = COALESCE($8, pretention_salariale),
               disponibilite = COALESCE($9, disponibilite),
               score_evaluation = COALESCE($10, score_evaluation),
               poste_vise = COALESCE($11, poste_vise),
               telephone = COALESCE($12, telephone),
               email = COALESCE($13, email),
               updated_by = $14,
               updated_at = CURRENT_TIMESTAMP
         WHERE id_applicant = $1 RETURNING *`,
        [req.params.id, id_stage ?? null, statut ?? null, notes ?? null,
         source_candidature ?? null, niveau_etudes ?? null, experience_annees ?? null,
         pretention_salariale ?? null, disponibilite ?? null, score_evaluation ?? null,
         poste_vise ?? null, telephone ?? null, email ?? null,
         req.user?.id || null]
      );

      // Log stage change
      if (id_stage != null && oldStage != null && Number(id_stage) !== Number(oldStage)) {
        await logEvent(req.params.id, 'stage_change', {
          from_stage: oldStage, to_stage: id_stage
        }, req.user?.id || null);
      }

      try {
        const io = await getIo();
        if (io && r.rows[0]) io.emit('recruitment:updated', r.rows[0]);
      } catch {}

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
      await logEvent(req.params.id, 'hire', {}, req.user?.id || null);
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
      await logEvent(req.params.id, 'reject', { notes: req.body?.motif || null }, req.user?.id || null);
      return sendSuccess(res, r.rows[0] || { id: req.params.id, statut: 'refuse' }, 'Candidat refusé');
    } catch (error) {
      return handleError(res, error, 'rejectRecruitment');
    }
  };
  router.post('/:id(\\d+)/reject', authenticate, rejectHandler);
  router.post('/:id(\\d+)/refuse', authenticate, rejectHandler);
};
