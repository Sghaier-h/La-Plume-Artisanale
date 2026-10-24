// model.js — publicite/metriques
// Table : metriques_pub_journalieres (§11quinquies.9)
// Note : ctr_pct, cpc, roas sont des colonnes GENERATED ALWAYS AS STORED — jamais insérées/mises à jour.
import { getPool } from '../../_shared/db.js';

const insertColumns = [
  'id_campagne','id_creative','date_jour',
  'impressions','clics','depense',
  'conversions','valeur_conversions','devise',
];

export const model = {
  async list({ where = {}, limit = 200, offset = 0 }) {
    const { date_from, date_to, ...eq } = where;
    const clauses = []; const params = []; let i = 1;
    for (const [k, v] of Object.entries(eq)) {
      if (v == null) continue;
      clauses.push(`${k} = $${i++}`); params.push(v);
    }
    if (date_from) { clauses.push(`date_jour >= $${i++}`); params.push(date_from); }
    if (date_to)   { clauses.push(`date_jour <= $${i++}`); params.push(date_to); }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const dataSql  = `SELECT * FROM metriques_pub_journalieres ${whereSql}
                       ORDER BY date_jour DESC, id_campagne ASC LIMIT $${i} OFFSET $${i+1}`;
    const countSql = `SELECT COUNT(*)::int AS total FROM metriques_pub_journalieres ${whereSql}`;
    const [data, count] = await Promise.all([
      getPool().query(dataSql, [...params, limit, offset]),
      getPool().query(countSql, params),
    ]);
    return { rows: data.rows, total: count.rows[0].total };
  },

  /** Upsert par (id_campagne, id_creative, date_jour) — l'UNIQUE le garantit. */
  async upsert(entry) {
    const cols = []; const vals = []; const params = []; let i = 1;
    for (const c of insertColumns) {
      if (entry[c] !== undefined) { cols.push(c); vals.push(`$${i++}`); params.push(entry[c]); }
    }
    const updateSet = cols
      .filter((c) => !['id_campagne','id_creative','date_jour'].includes(c))
      .map((c) => `${c} = EXCLUDED.${c}`).join(', ');
    const sql = `
      INSERT INTO metriques_pub_journalieres (${cols.join(',')})
      VALUES (${vals.join(',')})
      ON CONFLICT (id_campagne, id_creative, date_jour)
      DO UPDATE SET ${updateSet}
      RETURNING *`;
    const { rows } = await getPool().query(sql, params);
    return rows[0];
  },

  /** Ingestion en batch — retourne le nombre de lignes upsertées. */
  async upsertBatch(entries) {
    const results = [];
    for (const e of entries) results.push(await this.upsert(e));
    return results;
  },

  /** Agrégats sur période, groupés par campagne. */
  async aggregateByCampagne({ id_compte_pub, date_from, date_to }) {
    const params = []; const clauses = [];
    let i = 1;
    if (id_compte_pub) { clauses.push(`c.id_compte_pub = $${i++}`); params.push(id_compte_pub); }
    if (date_from)     { clauses.push(`m.date_jour >= $${i++}`);    params.push(date_from); }
    if (date_to)       { clauses.push(`m.date_jour <= $${i++}`);    params.push(date_to); }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `
      SELECT c.id_campagne, c.nom AS campagne, c.canal_cible, c.statut,
             SUM(m.impressions)::int         AS impressions,
             SUM(m.clics)::int               AS clics,
             SUM(m.depense)::numeric(12,2)   AS depense,
             SUM(m.conversions)::int         AS conversions,
             SUM(m.valeur_conversions)::numeric(12,3) AS valeur_conversions,
             CASE WHEN SUM(m.impressions) > 0 THEN (SUM(m.clics)::numeric / SUM(m.impressions) * 100) ELSE 0 END AS ctr_pct,
             CASE WHEN SUM(m.clics) > 0 THEN (SUM(m.depense) / SUM(m.clics)) ELSE 0 END                          AS cpc,
             CASE WHEN SUM(m.depense) > 0 THEN (SUM(m.valeur_conversions) / SUM(m.depense)) ELSE 0 END           AS roas
        FROM metriques_pub_journalieres m
        JOIN campagnes_pub c ON c.id_campagne = m.id_campagne
        ${whereSql}
       GROUP BY c.id_campagne, c.nom, c.canal_cible, c.statut
       ORDER BY depense DESC`;
    const { rows } = await getPool().query(sql, params);
    return rows;
  },

  /** Résumé global pour une campagne. */
  async summaryCampagne(idCampagne, { date_from, date_to } = {}) {
    const params = [idCampagne]; const clauses = ['id_campagne = $1']; let i = 2;
    if (date_from) { clauses.push(`date_jour >= $${i++}`); params.push(date_from); }
    if (date_to)   { clauses.push(`date_jour <= $${i++}`); params.push(date_to); }
    const sql = `
      SELECT SUM(impressions)::int         AS impressions,
             SUM(clics)::int               AS clics,
             SUM(depense)::numeric(12,2)   AS depense,
             SUM(conversions)::int         AS conversions,
             SUM(valeur_conversions)::numeric(12,3) AS valeur_conversions,
             CASE WHEN SUM(impressions) > 0 THEN (SUM(clics)::numeric / SUM(impressions) * 100) ELSE 0 END AS ctr_pct,
             CASE WHEN SUM(clics) > 0 THEN (SUM(depense) / SUM(clics)) ELSE 0 END                          AS cpc,
             CASE WHEN SUM(depense) > 0 THEN (SUM(valeur_conversions) / SUM(depense)) ELSE 0 END           AS roas
        FROM metriques_pub_journalieres
       WHERE ${clauses.join(' AND ')}`;
    const { rows } = await getPool().query(sql, params);
    return rows[0] || null;
  },
};

export default model;
