// routes.js — stock/reservations (T3c)
// GET  /api/v2/stock/reservations?statut=ACTIVE&id_article=&id_reference=
// POST /api/v2/stock/reservations
//   Payload : { id_article, id_entrepot, quantite_reservee, id_reference,
//               type_reference: 'COMMANDE_CLIENT'|'OF'|'TRANSFERT'|'AUTRE',
//               date_expiration?, notes? }
import { Router } from 'express';
import { getPool } from '../../_shared/db.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

const router = Router();

async function tableExists(name) {
  const r = await getPool().query(`SELECT to_regclass($1) AS t`, [`public.${name}`]);
  return !!r.rows[0].t;
}

router.get('/', asyncHandler(async (req, res) => {
  if (!(await tableExists('reservations_stock'))) {
    return res.json(ok([], { count: 0, message: 'En attente d\'implémentation DB (reservations_stock)' }));
  }
  const { statut, id_article, id_reference, type_reference } = req.query;
  const { limit, offset } = paginateFromReq(req, { limit: 100, offset: 0 });
  const p = []; const w = [];
  if (statut)         { p.push(statut);         w.push(`statut = $${p.length}`); }
  if (id_article)     { p.push(id_article);     w.push(`id_article = $${p.length}`); }
  if (id_reference)   { p.push(id_reference);   w.push(`id_reference = $${p.length}`); }
  if (type_reference) { p.push(type_reference); w.push(`type_reference = $${p.length}`); }
  p.push(limit); p.push(offset);
  const sql = `SELECT * FROM reservations_stock
               ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
               ORDER BY date_reservation DESC
               LIMIT $${p.length - 1} OFFSET $${p.length}`;
  const r = await getPool().query(sql, p);
  return res.json(ok(r.rows, { count: r.rows.length, limit, offset }));
}));

router.post('/', asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!b.id_article || !b.id_entrepot || !b.quantite_reservee
      || !b.id_reference || !b.type_reference) {
    return res.status(400).json(fail(
      'BAD_INPUT',
      'id_article, id_entrepot, quantite_reservee, id_reference, type_reference requis'
    ));
  }
  const userId = req.user?.id || req.user?.id_user || null;

  if (!(await tableExists('reservations_stock'))) {
    return res.status(200).json(ok({
      stub: true,
      payload: b,
      message: 'En attente d\'implémentation DB (reservations_stock)',
    }));
  }
  try {
    const r = await getPool().query(
      `INSERT INTO reservations_stock
         (id_article, id_entrepot, quantite_reservee,
          id_reference, type_reference,
          date_reservation, date_expiration, statut,
          created_by, notes)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, 'ACTIVE', $7, $8)
       RETURNING *`,
      [b.id_article, b.id_entrepot, b.quantite_reservee,
       b.id_reference, b.type_reference,
       b.date_expiration ?? null, userId, b.notes ?? null]
    );
    return res.status(201).json(ok(r.rows[0]));
  } catch (e) {
    return res.status(400).json(fail('DB_ERROR', e.message));
  }
}));

// Libération
router.post('/:id(\\d+)/liberer', asyncHandler(async (req, res) => {
  const r = await getPool().query(
    `UPDATE reservations_stock
        SET statut = 'LIBEREE', date_liberation = NOW()
      WHERE id_reservation = $1
      RETURNING *`,
    [req.params.id]
  );
  if (!r.rows[0]) return res.status(404).json(fail('NOT_FOUND', 'Réservation introuvable', null, 404));
  return res.json(ok(r.rows[0]));
}));

export default router;
