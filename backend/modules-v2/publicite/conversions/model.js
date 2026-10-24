// model.js — publicite/conversions
// Table : conversions_pub (§11quinquies.9)
import { getPool } from '../../_shared/db.js';

const insertColumns = [
  'id_campagne','id_creative','id_commande_web','id_site','type_conversion',
  'utm_source','utm_medium','utm_campaign','utm_content','utm_term',
  'valeur','devise','fbclid','gclid','ttclid','user_agent','ip',
];

export const model = {
  async list({ where = {}, limit = 200, offset = 0 }) {
    const { date_from, date_to, ...eq } = where;
    const clauses = []; const params = []; let i = 1;
    for (const [k, v] of Object.entries(eq)) {
      if (v == null) continue;
      clauses.push(`${k} = $${i++}`); params.push(v);
    }
    if (date_from) { clauses.push(`date_conversion >= $${i++}`); params.push(date_from); }
    if (date_to)   { clauses.push(`date_conversion <= $${i++}`); params.push(date_to); }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const dataSql  = `SELECT * FROM conversions_pub ${whereSql} ORDER BY date_conversion DESC LIMIT $${i} OFFSET $${i+1}`;
    const countSql = `SELECT COUNT(*)::int AS total FROM conversions_pub ${whereSql}`;
    const [data, count] = await Promise.all([
      getPool().query(dataSql, [...params, limit, offset]),
      getPool().query(countSql, params),
    ]);
    return { rows: data.rows, total: count.rows[0].total };
  },

  async insert(entry) {
    const cols = []; const vals = []; const params = []; let i = 1;
    for (const c of insertColumns) {
      if (entry[c] !== undefined) { cols.push(c); vals.push(`$${i++}`); params.push(entry[c]); }
    }
    const sql = `INSERT INTO conversions_pub (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
    const { rows } = await getPool().query(sql, params);
    return rows[0];
  },

  async summaryByUtm({ date_from, date_to } = {}) {
    const params = []; const clauses = ['utm_campaign IS NOT NULL']; let i = 1;
    if (date_from) { clauses.push(`date_conversion >= $${i++}`); params.push(date_from); }
    if (date_to)   { clauses.push(`date_conversion <= $${i++}`); params.push(date_to); }
    const sql = `
      SELECT utm_source, utm_medium, utm_campaign,
             COUNT(*)::int AS conversions,
             SUM(COALESCE(valeur,0))::numeric(12,3) AS valeur_totale
        FROM conversions_pub
       WHERE ${clauses.join(' AND ')}
       GROUP BY utm_source, utm_medium, utm_campaign
       ORDER BY valeur_totale DESC`;
    const { rows } = await getPool().query(sql, params);
    return rows;
  },
};

export default model;
