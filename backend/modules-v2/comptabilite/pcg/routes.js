// routes.js — comptabilite/pcg (T3c)
// GET /api/v2/comptabilite/pcg
//   Liste le Plan Comptable Général Tunisien (table plan_comptable_tunisien).
//   Filtres : ?classe=4 ?nature=actif ?q=client ?actif=true
import { Router } from 'express';
import { getPool } from '../../_shared/db.js';
import { ok, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { classe, nature, q, actif } = req.query;
  const { limit, offset } = paginateFromReq(req, { limit: 200, offset: 0 });
  const p = []; const w = [];
  if (classe) { p.push(Number(classe)); w.push(`classe = $${p.length}`); }
  if (nature) { p.push(nature);          w.push(`nature = $${p.length}`); }
  if (q) {
    p.push(`%${q}%`);
    w.push(`(numero_compte ILIKE $${p.length} OR intitule ILIKE $${p.length})`);
  }
  if (actif !== undefined) { p.push(actif === 'true'); w.push(`actif = $${p.length}`); }

  try {
    p.push(limit); p.push(offset);
    const sql = `SELECT id_compte, numero_compte, intitule, classe, nature,
                        compte_parent, est_collectif, lettrable, actif
                   FROM plan_comptable_tunisien
                   ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
                   ORDER BY numero_compte
                   LIMIT $${p.length - 1} OFFSET $${p.length}`;
    const r = await getPool().query(sql, p);
    return res.json(ok(r.rows, { count: r.rows.length, limit, offset }));
  } catch (e) {
    return res.json(ok([], { count: 0, message: 'En attente d\'implémentation DB (plan_comptable_tunisien)' }));
  }
}));

router.get('/:numero', asyncHandler(async (req, res) => {
  try {
    const r = await getPool().query(
      `SELECT * FROM plan_comptable_tunisien WHERE numero_compte = $1 LIMIT 1`,
      [req.params.numero]
    );
    if (!r.rows[0]) {
      return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Compte introuvable' } });
    }
    return res.json(ok(r.rows[0]));
  } catch (e) {
    return res.json(ok(null, { message: e.message }));
  }
}));

export default router;
