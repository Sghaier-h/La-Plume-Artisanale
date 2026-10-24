import { Router } from 'express';
import * as c from './controller.js';
import { getPool } from '../../_shared/db.js';
import { ok, asyncHandler } from '../../_shared/api-envelope.js';
const r = Router();
r.get('/taux-2e-choix-machines-7j', c.taux2eChoix);
r.get('/defauts-par-type',           c.defautsParType);

/**
 * T3c — GET /api/v2/qualite/rapports/mensuel?mois=YYYY-MM
 * Pareto des défauts + taux de conformité du mois.
 */
r.get('/mensuel', asyncHandler(async (req, res) => {
  const pool = getPool();
  const mois = (req.query.mois || '').match(/^\d{4}-\d{2}$/)
    ? req.query.mois
    : new Date().toISOString().slice(0, 7);
  const [annee, moisNum] = mois.split('-').map(Number);
  const debut = `${annee}-${String(moisNum).padStart(2, '0')}-01`;
  // Fin : premier jour du mois suivant (exclu)
  const finDate = new Date(Date.UTC(annee, moisNum, 1));
  const fin = finDate.toISOString().slice(0, 10);

  let pareto = [];
  let totalDefauts = 0;
  try {
    const r1 = await pool.query(`
      SELECT dt.code, dt.libelle, dt.categorie, dt.severite_defaut,
             COUNT(ds.id_defaut_signale)::int AS nb,
             COALESCE(SUM(ds.quantite_impactee), 0)::numeric AS qte_impactee
        FROM defauts_signales ds
        JOIN defauts_types dt ON dt.id_defaut_type = ds.id_defaut_type
       WHERE ds.date_signalement >= $1
         AND ds.date_signalement < $2
       GROUP BY dt.code, dt.libelle, dt.categorie, dt.severite_defaut
       ORDER BY nb DESC
    `, [debut, fin]);
    pareto = r1.rows;
    totalDefauts = pareto.reduce((s, x) => s + Number(x.nb), 0);
    // Enrichissement : part cumulée pour Pareto
    let cumul = 0;
    pareto = pareto.map(row => {
      cumul += Number(row.nb);
      return {
        ...row,
        part_pct: totalDefauts > 0 ? Math.round((row.nb / totalDefauts) * 10000) / 100 : 0,
        cumul_pct: totalDefauts > 0 ? Math.round((cumul / totalDefauts) * 10000) / 100 : 0,
      };
    });
  } catch (e) {}

  // Taux conformité : approximation via journal_pieces (1er choix / total déclaré)
  let tauxConformite = null;
  try {
    const r2 = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN categorie = '1er_choix' THEN quantite ELSE 0 END), 0)::numeric AS q1,
        COALESCE(SUM(quantite), 0)::numeric AS qtotal
      FROM journal_pieces
      WHERE date_saisie >= $1 AND date_saisie < $2
    `, [debut, fin]);
    const q1 = Number(r2.rows[0]?.q1 || 0);
    const qt = Number(r2.rows[0]?.qtotal || 0);
    tauxConformite = qt > 0 ? Math.round((q1 / qt) * 10000) / 100 : null;
  } catch (e) {}

  return res.json(ok({
    mois,
    debut, fin,
    pareto_defauts: pareto,
    total_defauts: totalDefauts,
    taux_conformite_pct: tauxConformite,
  }));
}));

export default r;
