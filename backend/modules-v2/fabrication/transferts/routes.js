// routes.js — fabrication/transferts (T3c)
// POST /api/v2/fabrication/transferts
//   Payload : { id_of, etape_depuis, etape_vers, type: 'interne'|'sous-traitance', id_sous_traitant? }
//
// Dégradation gracieuse :
//   - Si la table `transferts_of` existe → INSERT direct.
//   - Sinon → tente `of_status_transitions` (schema v2) comme fallback.
//   - Sinon → renvoie 200 OK avec payload (stub en attente d'implémentation DB).
import { Router } from 'express';
import { getPool } from '../../_shared/db.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';

const router = Router();

async function tableExists(table) {
  const r = await getPool().query(
    `SELECT to_regclass($1) AS t`,
    [`public.${table}`]
  );
  return !!r.rows[0].t;
}

router.get('/', asyncHandler(async (req, res) => {
  const pool = getPool();
  const { id_of, type, limit = 100 } = req.query;
  // Priorité à transferts_of si existe, sinon of_status_transitions
  if (await tableExists('transferts_of')) {
    const w = []; const p = [];
    if (id_of) { p.push(id_of); w.push(`id_of = $${p.length}`); }
    if (type)  { p.push(type);  w.push(`type = $${p.length}`); }
    p.push(Math.min(500, Number(limit) || 100));
    const sql = `SELECT * FROM transferts_of
                 ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
                 ORDER BY date_transfert DESC NULLS LAST, id_transfert DESC
                 LIMIT $${p.length}`;
    const r = await pool.query(sql, p);
    return res.json(ok(r.rows, { count: r.rows.length, source: 'transferts_of' }));
  }
  if (await tableExists('of_status_transitions')) {
    const w = []; const p = [];
    if (id_of) { p.push(id_of); w.push(`id_of = $${p.length}`); }
    p.push(Math.min(500, Number(limit) || 100));
    const sql = `SELECT * FROM of_status_transitions
                 ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
                 ORDER BY horodatage DESC
                 LIMIT $${p.length}`;
    const r = await pool.query(sql, p);
    return res.json(ok(r.rows, { count: r.rows.length, source: 'of_status_transitions' }));
  }
  return res.json(ok([], { count: 0, message: 'En attente d\'implémentation DB (transferts_of)' }));
}));

router.post('/', asyncHandler(async (req, res) => {
  const pool = getPool();
  const b = req.body || {};
  if (!b.id_of || !b.etape_vers) {
    return res.status(400).json(fail('BAD_INPUT', 'id_of et etape_vers requis'));
  }
  const userId = req.user?.id || req.user?.id_user || null;
  const type = b.type || 'interne';

  // Option 1 : transferts_of (table dédiée)
  if (await tableExists('transferts_of')) {
    try {
      const r = await pool.query(
        `INSERT INTO transferts_of
           (id_of, etape_depuis, etape_vers, type, id_sous_traitant,
            date_transfert, id_utilisateur, commentaire)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
         RETURNING *`,
        [b.id_of, b.etape_depuis ?? null, b.etape_vers, type,
         b.id_sous_traitant ?? null, userId, b.commentaire ?? null]
      );
      return res.status(201).json(ok(r.rows[0], { source: 'transferts_of' }));
    } catch (e) {
      // retomber sur le fallback
    }
  }

  // Option 2 : fallback via of_status_transitions
  if (await tableExists('of_status_transitions')) {
    try {
      const r = await pool.query(
        `INSERT INTO of_status_transitions
           (id_of, statut_avant, statut_apres, motif, commentaire, id_utilisateur)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [b.id_of,
         b.etape_depuis ?? null,
         b.etape_vers,
         `transfert_${type}`,
         b.id_sous_traitant ? `ST #${b.id_sous_traitant}` : (b.commentaire ?? null),
         userId]
      );
      return res.status(201).json(ok(r.rows[0], { source: 'of_status_transitions' }));
    } catch (e) {
      return res.status(200).json(ok({
        stub: true,
        payload: b,
        message: 'En attente d\'implémentation DB (transferts_of/of_status_transitions)',
        error: e.message,
      }));
    }
  }

  // Option 3 : stub
  return res.status(200).json(ok({
    stub: true,
    payload: b,
    message: 'En attente d\'implémentation DB (table transferts_of non créée)',
  }));
}));

export default router;
