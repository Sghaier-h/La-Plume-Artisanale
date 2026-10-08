import { getPool } from '../../_shared/db.js';

const COLS = [
  'numero_mouvement','type_mouvement','id_article','quantite','id_lot','qr_mp_reel',
  'id_entrepot_source','id_emplacement_source',
  'id_entrepot_destination','id_emplacement_destination',
  'id_document_lie','type_document_lie','motif',
  'date_mouvement','effectue_par','valide_par','statut',
];

export const model = {
  async list({ where = {}, limit, offset }) {
    const clauses = [];
    const params = [];
    let i = 1;
    for (const [k, v] of Object.entries(where)) {
      if (v === undefined || v === null) continue;
      if (k === 'date_min') { clauses.push(`date_mouvement >= $${i++}`); params.push(v); continue; }
      if (k === 'date_max') { clauses.push(`date_mouvement <= $${i++}`); params.push(v); continue; }
      clauses.push(`${k} = $${i++}`);
      params.push(v);
    }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sqlData = `SELECT * FROM mouvements_stock ${whereSql}
                     ORDER BY date_mouvement DESC, id_mouvement DESC
                     LIMIT $${i} OFFSET $${i + 1}`;
    const sqlCount = `SELECT COUNT(*)::int AS total FROM mouvements_stock ${whereSql}`;
    const [data, count] = await Promise.all([
      getPool().query(sqlData, [...params, limit, offset]),
      getPool().query(sqlCount, params),
    ]);
    return { rows: data.rows, total: count.rows[0].total };
  },

  async findById(id) {
    const { rows } = await getPool().query(
      `SELECT * FROM mouvements_stock WHERE id_mouvement = $1 LIMIT 1`, [id],
    );
    return rows[0] || null;
  },

  /**
   * INSERT dans un client de transaction fourni.
   * @param {import('pg').PoolClient} client
   * @param {object} payload
   */
  async insertInTx(client, payload) {
    const cols = [];
    const vals = [];
    const params = [];
    let i = 1;
    for (const c of COLS) {
      if (payload[c] !== undefined) {
        cols.push(c); vals.push(`$${i++}`); params.push(payload[c]);
      }
    }
    const sql = `INSERT INTO mouvements_stock (${cols.join(',')})
                 VALUES (${vals.join(',')})
                 RETURNING *`;
    const { rows } = await client.query(sql, params);
    return rows[0];
  },

  async updateStatut(id, statut, valide_par) {
    const { rows } = await getPool().query(
      `UPDATE mouvements_stock
          SET statut = $1, valide_par = COALESCE($2, valide_par)
        WHERE id_mouvement = $3
        RETURNING *`,
      [statut, valide_par ?? null, id],
    );
    return rows[0] || null;
  },
};
