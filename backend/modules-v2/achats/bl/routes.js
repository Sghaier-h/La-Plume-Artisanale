// routes.js — achats/bl (T3c)
// GET /api/v2/achats/bl?id_fournisseur=&statut=
// POST /api/v2/achats/bl
// Dégradation gracieuse si table bl_fournisseur / bons_livraison_fournisseur absente.
import { Router } from 'express';
import { getPool } from '../../_shared/db.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

const router = Router();

async function pickTable(candidates) {
  for (const c of candidates) {
    const r = await getPool().query(`SELECT to_regclass($1) AS t`, [`public.${c}`]);
    if (r.rows[0].t) return c;
  }
  return null;
}

const TABLE_CANDIDATES = [
  'bl_fournisseur',
  'bons_livraison_fournisseur',
  'bl_fournisseurs',
  'bons_livraison',
];

router.get('/', asyncHandler(async (req, res) => {
  const table = await pickTable(TABLE_CANDIDATES);
  if (!table) {
    return res.json(ok([], {
      count: 0,
      message: 'En attente d\'implémentation DB (table bl_fournisseur absente)',
      tried: TABLE_CANDIDATES,
    }));
  }
  const { id_fournisseur, statut } = req.query;
  const { limit, offset } = paginateFromReq(req, { limit: 100, offset: 0 });
  const p = []; const w = [];
  if (id_fournisseur) { p.push(id_fournisseur); w.push(`id_fournisseur = $${p.length}`); }
  if (statut)         { p.push(statut);         w.push(`statut = $${p.length}`); }
  p.push(limit); p.push(offset);
  try {
    const sql = `SELECT * FROM ${table}
                 ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
                 ORDER BY 1 DESC
                 LIMIT $${p.length - 1} OFFSET $${p.length}`;
    const r = await getPool().query(sql, p);
    return res.json(ok(r.rows, { count: r.rows.length, source: table, limit, offset }));
  } catch (e) {
    return res.json(ok([], { count: 0, message: e.message, source: table }));
  }
}));

router.post('/', asyncHandler(async (req, res) => {
  const table = await pickTable(TABLE_CANDIDATES);
  if (!table) {
    return res.status(200).json(ok({
      stub: true, payload: req.body,
      message: 'En attente d\'implémentation DB (table bl_fournisseur à créer)',
    }));
  }
  const b = req.body || {};
  if (!b.id_fournisseur) {
    return res.status(400).json(fail('BAD_INPUT', 'id_fournisseur requis'));
  }
  try {
    const cols = Object.keys(b);
    const vals = Object.values(b);
    const place = cols.map((_, i) => `$${i + 1}`).join(',');
    const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${place}) RETURNING *`;
    const r = await getPool().query(sql, vals);
    return res.status(201).json(ok(r.rows[0], { source: table }));
  } catch (e) {
    return res.status(400).json(fail('DB_ERROR', e.message));
  }
}));

export default router;
