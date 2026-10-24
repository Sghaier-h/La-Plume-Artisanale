// routes.js — fabrication/interventions (T3c)
// GET /api/v2/fabrication/interventions?statut=&id_machine=&limit=
// Vue consolidée des interventions (basée sur demandes_intervention).
import { Router } from 'express';
import { getPool } from '../../_shared/db.js';
import { ok, asyncHandler } from '../../_shared/api-envelope.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { statut, id_machine, type_intervention, priorite, limit = 100 } = req.query;
  const p = []; const w = [];
  if (statut)            { p.push(statut);            w.push(`di.statut = $${p.length}`); }
  if (id_machine)        { p.push(id_machine);        w.push(`di.id_machine = $${p.length}`); }
  if (type_intervention) { p.push(type_intervention); w.push(`di.type_intervention = $${p.length}`); }
  if (priorite)          { p.push(priorite);          w.push(`di.priorite = $${p.length}`); }
  p.push(Math.min(500, Number(limit) || 100));
  try {
    const sql = `
      SELECT di.id_demande AS id, di.numero_demande, di.date_demande,
             di.type_intervention, di.priorite, di.statut, di.description,
             di.id_machine, m.numero_machine,
             di.date_debut_intervention, di.date_fin_intervention,
             di.temps_reponse, di.duree_intervention, di.cout_intervention,
             di.assigne_a, di.demande_par
        FROM demandes_intervention di
        LEFT JOIN machines m ON m.id_machine = di.id_machine
        ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
        ORDER BY di.date_demande DESC NULLS LAST, di.id_demande DESC
        LIMIT $${p.length}
    `;
    const r = await getPool().query(sql, p);
    return res.json(ok(r.rows, { count: r.rows.length }));
  } catch (e) {
    return res.json(ok([], { count: 0, message: 'En attente d\'implémentation DB (demandes_intervention)' }));
  }
}));

export default router;
