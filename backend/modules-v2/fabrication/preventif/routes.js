// routes.js — fabrication/preventif (T3c)
// GET /api/v2/fabrication/preventif
// Maintenances préventives planifiées : préféré via `plans_maintenance` ou
// `gammes_maintenance` si existe, sinon projection depuis machines.date_prochaine_maintenance.
import { Router } from 'express';
import { getPool } from '../../_shared/db.js';
import { ok, asyncHandler } from '../../_shared/api-envelope.js';

const router = Router();

async function tableExists(name) {
  const r = await getPool().query(`SELECT to_regclass($1) AS t`, [`public.${name}`]);
  return !!r.rows[0].t;
}

router.get('/', asyncHandler(async (req, res) => {
  const pool = getPool();
  const { id_machine, dans_jours } = req.query;
  const horizon = Math.max(1, Math.min(365, Number(dans_jours) || 60));

  // 1) Si une table dédiée existe
  for (const candidate of ['plans_maintenance', 'gammes_maintenance', 'maintenance_preventif']) {
    if (await tableExists(candidate)) {
      try {
        const p = []; const w = [];
        if (id_machine) { p.push(id_machine); w.push(`id_machine = $${p.length}`); }
        const sql = `SELECT * FROM ${candidate}
                     ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
                     ORDER BY 1 LIMIT 500`;
        const r = await pool.query(sql, p);
        return res.json(ok(r.rows, { count: r.rows.length, source: candidate }));
      } catch {}
    }
  }

  // 2) Fallback — projection depuis machines
  try {
    const p = [horizon]; const w = [`m.date_prochaine_maintenance IS NOT NULL`,
                                   `m.date_prochaine_maintenance <= CURRENT_DATE + ($1 || ' days')::interval`,
                                   `m.actif = TRUE`];
    if (id_machine) { p.push(id_machine); w.push(`m.id_machine = $${p.length}`); }
    const sql = `
      SELECT m.id_machine, m.numero_machine, m.marque, m.modele,
             m.date_derniere_maintenance,
             m.date_prochaine_maintenance,
             (m.date_prochaine_maintenance - CURRENT_DATE) AS jours_restants
        FROM machines m
       WHERE ${w.join(' AND ')}
       ORDER BY m.date_prochaine_maintenance
       LIMIT 500
    `;
    const r = await pool.query(sql, p);
    return res.json(ok(r.rows, {
      count: r.rows.length,
      source: 'machines.date_prochaine_maintenance',
      horizon_jours: horizon,
    }));
  } catch (e) {
    return res.json(ok([], {
      count: 0,
      message: 'En attente d\'implémentation DB (plans_maintenance / machines.date_prochaine_maintenance)',
    }));
  }
}));

export default router;
