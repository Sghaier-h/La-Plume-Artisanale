// service.js — ventes/stats (Phase G2)
import { getPool } from '../../_shared/db.js';
const pool = getPool();

/**
 * CA 12 derniers mois agrégé sur `factures` :
 *   - mois          (YYYY-MM)
 *   - montant_ht    (SUM)
 *   - nb_factures   (COUNT)
 *   - panier_moyen  (AVG)
 * Fallback [] si erreur SQL (table absente, schéma différent, …).
 */
export async function ca12Mois({ id_commercial } = {}) {
  try {
    const params = [];
    const whereCommercial = id_commercial
      ? `AND id_utilisateur_creation = $${params.push(Number(id_commercial))}`
      : '';
    const sql = `
      SELECT TO_CHAR(DATE_TRUNC('month', date_facture), 'YYYY-MM') AS mois,
             COALESCE(SUM(montant_ht), 0)::numeric                 AS montant_ht,
             COUNT(*)::int                                         AS nb_factures,
             COALESCE(AVG(montant_ht), 0)::numeric                 AS panier_moyen
        FROM factures
       WHERE date_facture >= NOW() - INTERVAL '12 months'
         AND statut <> 'annulee'
         ${whereCommercial}
       GROUP BY 1
       ORDER BY 1`;
    const { rows } = await pool.query(sql, params);
    return rows.map(r => ({
      mois: r.mois,
      montant_ht: Number(r.montant_ht || 0),
      nb_factures: Number(r.nb_factures || 0),
      panier_moyen: Number(r.panier_moyen || 0),
    }));
  } catch {
    return [];
  }
}
