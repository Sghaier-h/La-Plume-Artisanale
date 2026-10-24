import { Router } from 'express';
import * as c from './controller.js';
import { getPool } from '../../_shared/db.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';

const r = Router();

// T3c — GET /api/v2/sous-traitance/retours (liste filtrable)
// Filtre : ?statut= &id_sous_traitant= &limit=
r.get('/', asyncHandler(async (req, res) => {
  const pool = getPool();
  const { statut, id_sous_traitant, limit = 100 } = req.query;
  const p = []; const w = ["type_mouvement = 'retour'"];
  if (statut)            { p.push(statut);            w.push(`statut = $${p.length}`); }
  if (id_sous_traitant)  { p.push(id_sous_traitant);  w.push(`id_sous_traitant = $${p.length}`); }
  p.push(Math.min(500, Number(limit) || 100));
  try {
    const r2 = await pool.query(
      `SELECT * FROM mouvements_sous_traitance
       WHERE ${w.join(' AND ')}
       ORDER BY date_mouvement DESC NULLS LAST
       LIMIT $${p.length}`,
      p
    );
    return res.json(ok(r2.rows, { count: r2.rows.length }));
  } catch (e) {
    return res.json(ok([], { count: 0, message: 'En attente d\'implémentation DB (mouvements_sous_traitance)' }));
  }
}));

r.post('/:id/receptionner', c.receptionner);
r.post('/:id/litige',       c.litige);
r.get('/:id/historique',    c.historique);

// Phase T1 — POST /api/v2/sous-traitance/retours
// Enregistre le retour d'un mouvement sous-traitance : passe le mouvement
// origine en statut 'retour_complet' + crée un nouvel enregistrement de type
// 'retour' dans mouvements_sous_traitance avec la signature SVG en obs.
r.post('/', asyncHandler(async (req, res) => {
  const pool = getPool();
  const b = req.body || {};
  if (!b.id_mouvement_st) {
    return res.status(400).json(fail('BAD_INPUT', 'id_mouvement_st requis'));
  }
  const userId = req.user?.id || req.user?.userId || null;

  // Mouvement origine
  const orig = await pool.query(
    `SELECT * FROM mouvements_sous_traitance WHERE id_mouvement_st = $1`,
    [b.id_mouvement_st]
  );
  if (orig.rows.length === 0) {
    return res.status(404).json(fail('NOT_FOUND', 'Mouvement sous-traitance introuvable'));
  }
  const o = orig.rows[0];

  // Numéro retour RST-{YYYYMMDD}-{SEQ:4}
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const seqRes = await pool.query(
    `SELECT COUNT(*)::int + 1 AS n FROM mouvements_sous_traitance
      WHERE type_mouvement = 'retour' AND date_mouvement::date = CURRENT_DATE`
  );
  const numero = `RST-${today}-${String(seqRes.rows[0].n).padStart(4, '0')}`;

  const obs = b.signature_svg
    ? `Retour signé. Signature SVG: ${String(b.signature_svg).slice(0, 500)}`
    : (b.observations || null);

  const ins = await pool.query(
    `INSERT INTO mouvements_sous_traitance
       (numero_mouvement, id_sous_traitant, id_of, type_mouvement,
        date_retour_reelle, statut, observations, created_by)
     VALUES ($1, $2, $3, 'retour', NOW(), 'termine', $4, $5)
     RETURNING *`,
    [numero, o.id_sous_traitant, o.id_of, obs, userId]
  );

  // Marque le mouvement d'origine comme retourné
  await pool.query(
    `UPDATE mouvements_sous_traitance
        SET statut = 'termine', date_retour_reelle = NOW(), qr_code_retour = $1
      WHERE id_mouvement_st = $2`,
    [numero, b.id_mouvement_st]
  );

  return res.status(201).json(ok(ins.rows[0]));
}));

export default r;
