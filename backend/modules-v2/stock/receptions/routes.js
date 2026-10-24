// routes.js — stock/receptions (T3c)
// POST /api/v2/stock/receptions
//   Payload : { id_bl_fournisseur?, id_fournisseur, id_bc?, lignes: [{id_article, quantite, prix_unitaire?, numero_lot?}], notes? }
//   -> Insère receptions_fournisseur + mouvements_stock (ENTREE) par ligne.
// GET /api/v2/stock/receptions?id_fournisseur=&date_debut=&date_fin=
import { Router } from 'express';
import { getPool } from '../../_shared/db.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

const router = Router();

async function tableExists(name) {
  const r = await getPool().query(`SELECT to_regclass($1) AS t`, [`public.${name}`]);
  return !!r.rows[0].t;
}

router.get('/', asyncHandler(async (req, res) => {
  if (!(await tableExists('receptions_fournisseur'))) {
    return res.json(ok([], { count: 0, message: 'En attente d\'implémentation DB (receptions_fournisseur)' }));
  }
  const { id_fournisseur, date_debut, date_fin } = req.query;
  const { limit, offset } = paginateFromReq(req, { limit: 100, offset: 0 });
  const p = []; const w = [];
  if (id_fournisseur) { p.push(id_fournisseur); w.push(`id_fournisseur = $${p.length}`); }
  if (date_debut)     { p.push(date_debut);     w.push(`date_reception >= $${p.length}`); }
  if (date_fin)       { p.push(date_fin);       w.push(`date_reception <= $${p.length}`); }
  p.push(limit); p.push(offset);
  try {
    const sql = `SELECT * FROM receptions_fournisseur
                 ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
                 ORDER BY id_reception DESC
                 LIMIT $${p.length - 1} OFFSET $${p.length}`;
    const r = await getPool().query(sql, p);
    return res.json(ok(r.rows, { count: r.rows.length, limit, offset }));
  } catch (e) {
    return res.json(ok([], { count: 0, message: e.message }));
  }
}));

router.post('/', asyncHandler(async (req, res) => {
  const pool = getPool();
  const b = req.body || {};
  if (!b.id_fournisseur) {
    return res.status(400).json(fail('BAD_INPUT', 'id_fournisseur requis'));
  }
  const lignes = Array.isArray(b.lignes) ? b.lignes : [];
  const userId = req.user?.id || req.user?.id_user || null;

  if (!(await tableExists('receptions_fournisseur'))) {
    return res.status(200).json(ok({
      stub: true, payload: b,
      message: 'En attente d\'implémentation DB (receptions_fournisseur)',
    }));
  }

  // 1) Entête réception
  let reception = null;
  try {
    const cols = ['id_fournisseur'];
    const vals = [b.id_fournisseur];
    const place = ['$1'];
    const push = (col, val) => {
      if (val === undefined || val === null) return;
      cols.push(col); vals.push(val); place.push(`$${vals.length}`);
    };
    push('id_bc',               b.id_bc);
    push('id_bl_fournisseur',   b.id_bl_fournisseur);
    push('numero_reception',    b.numero_reception);
    push('date_reception',      b.date_reception);
    push('notes',               b.notes);
    push('created_by',          userId);
    const sql = `INSERT INTO receptions_fournisseur (${cols.join(',')})
                 VALUES (${place.join(',')}) RETURNING *`;
    const r = await pool.query(sql, vals);
    reception = r.rows[0];
  } catch (e) {
    return res.status(400).json(fail('DB_ERROR', e.message));
  }

  // 2) Mouvements ENTREE par ligne (best effort)
  const mouvements = [];
  if (lignes.length && await tableExists('mouvements_stock')) {
    for (const l of lignes) {
      if (!l.id_article || !l.quantite) continue;
      try {
        const r = await pool.query(
          `INSERT INTO mouvements_stock
             (type_mouvement, id_article, quantite, prix_unitaire,
              id_reference, type_reference, numero_lot, created_by)
           VALUES ('ENTREE', $1, $2, $3, $4, 'RECEPTION', $5, $6)
           RETURNING id_mouvement, id_article, quantite`,
          [l.id_article, l.quantite, l.prix_unitaire ?? null,
           reception.id_reception, l.numero_lot ?? null, userId]
        );
        mouvements.push(r.rows[0]);
      } catch (e) {
        mouvements.push({ error: e.message, ligne: l });
      }
    }
  }

  return res.status(201).json(ok({ reception, mouvements }));
}));

export default router;
