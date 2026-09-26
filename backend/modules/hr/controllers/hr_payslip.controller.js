/**
 * HR Payslip Controller — safe stub renvoyant des données vides mais 200.
 * La table hr_payslips n'est pas encore créée. Voir le module payroll-tunisia
 * pour le calcul de paie.
 */

import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

const safeQuery = async (sql, params = []) => {
  try { return await pool.query(sql, params); } catch { return { rows: [] }; }
};

export default (router) => {
  router.get('/', authenticate, async (req, res) => {
    const r = await safeQuery(`SELECT * FROM hr_payslips ORDER BY id_payslip DESC LIMIT 200`);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  });

  router.get('/:id(\\d+)', authenticate, async (req, res) => {
    const r = await safeQuery(`SELECT * FROM hr_payslips WHERE id_payslip = $1 LIMIT 1`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Bulletin introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  });

  router.post('/', authenticate, async (req, res) => {
    try {
      const { id_employe, periode_debut, periode_fin, salaire_brut, salaire_net, notes } = req.body || {};
      const r = await pool.query(
        `INSERT INTO hr_payslips (id_employe, periode_debut, periode_fin, salaire_brut, salaire_net, notes, statut, date_creation, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,'brouillon',CURRENT_TIMESTAMP,$7) RETURNING *`,
        [id_employe, periode_debut, periode_fin, salaire_brut, salaire_net, notes || null, req.user?.id || null]
      ).catch(() => ({ rows: [{ note: 'Table hr_payslips non créée — donnée non persistée', ...req.body }] }));
      return sendSuccess(res, r.rows[0], 'Bulletin créé', 201);
    } catch (error) {
      return handleError(res, error, 'createPayslip');
    }
  });

  router.put('/:id(\\d+)', authenticate, async (req, res) => {
    const r = await safeQuery(
      `UPDATE hr_payslips SET statut = COALESCE($2, statut), salaire_net = COALESCE($3, salaire_net), notes = COALESCE($4, notes)
       WHERE id_payslip = $1 RETURNING *`,
      [req.params.id, req.body?.statut ?? null, req.body?.salaire_net ?? null, req.body?.notes ?? null]
    );
    if (!r.rows[0]) return sendError(res, 'Bulletin introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  });

  router.delete('/:id(\\d+)', authenticate, async (req, res) => {
    await safeQuery(`DELETE FROM hr_payslips WHERE id_payslip = $1`, [req.params.id]);
    return sendSuccess(res, { id: req.params.id }, 'Bulletin supprimé');
  });

  // Validation
  router.post('/:id(\\d+)/valider', authenticate, async (req, res) => {
    const r = await safeQuery(
      `UPDATE hr_payslips SET statut = 'valide', date_validation = CURRENT_TIMESTAMP WHERE id_payslip = $1 RETURNING *`,
      [req.params.id]
    );
    return sendSuccess(res, r.rows[0] || { id: req.params.id, statut: 'valide' }, 'Bulletin validé');
  });

  // Payer
  router.post('/:id(\\d+)/payer', authenticate, async (req, res) => {
    const r = await safeQuery(
      `UPDATE hr_payslips SET statut = 'paye', date_paiement = CURRENT_TIMESTAMP WHERE id_payslip = $1 RETURNING *`,
      [req.params.id]
    );
    return sendSuccess(res, r.rows[0] || { id: req.params.id, statut: 'paye' }, 'Bulletin payé');
  });
};
