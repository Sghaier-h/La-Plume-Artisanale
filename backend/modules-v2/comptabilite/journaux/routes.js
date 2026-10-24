// routes.js — comptabilite/journaux (T3c)
// GET /api/v2/comptabilite/journaux
//   Liste les journaux comptables (table journaux_comptables, schema v2 §10).
import { Router } from 'express';
import { getPool } from '../../_shared/db.js';
import { ok, asyncHandler } from '../../_shared/api-envelope.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { type_journal, actif } = req.query;
  const p = []; const w = [];
  if (type_journal) { p.push(type_journal); w.push(`type_journal = $${p.length}`); }
  if (actif !== undefined) { p.push(actif === 'true'); w.push(`actif = $${p.length}`); }
  try {
    const sql = `SELECT id_journal, code, intitule, type_journal,
                        compte_contrepartie, actif, notes
                   FROM journaux_comptables
                   ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
                   ORDER BY code`;
    const r = await getPool().query(sql, p);
    return res.json(ok(r.rows, { count: r.rows.length }));
  } catch (e) {
    return res.json(ok([], { count: 0, message: 'En attente d\'implémentation DB (journaux_comptables)' }));
  }
}));

router.get('/:id(\\d+)', asyncHandler(async (req, res) => {
  try {
    const r = await getPool().query(
      `SELECT * FROM journaux_comptables WHERE id_journal = $1`,
      [req.params.id]
    );
    if (!r.rows[0]) {
      return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Journal introuvable' } });
    }
    return res.json(ok(r.rows[0]));
  } catch (e) {
    return res.json(ok(null, { message: e.message }));
  }
}));

export default router;
