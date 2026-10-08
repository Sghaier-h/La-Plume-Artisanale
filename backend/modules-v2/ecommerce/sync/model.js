// model.js — ecommerce/sync
// Table : ecommerce_sync_log (§11quinquies.3)
import { getPool } from '../../_shared/db.js';

export const model = {
  async list({ where = {}, limit = 100, offset = 0 }) {
    const clauses = [];
    const params  = [];
    let i = 1;
    for (const [k, v] of Object.entries(where)) {
      if (v == null) continue;
      clauses.push(`${k} = $${i++}`); params.push(v);
    }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const dataSql  = `SELECT * FROM ecommerce_sync_log ${whereSql} ORDER BY date_sync DESC LIMIT $${i} OFFSET $${i+1}`;
    const countSql = `SELECT COUNT(*)::int AS total FROM ecommerce_sync_log ${whereSql}`;
    const [data, count] = await Promise.all([
      getPool().query(dataSql, [...params, limit, offset]),
      getPool().query(countSql, params),
    ]);
    return { rows: data.rows, total: count.rows[0].total };
  },

  async findById(id) {
    const { rows } = await getPool().query(
      'SELECT * FROM ecommerce_sync_log WHERE id_sync = $1 LIMIT 1', [id],
    );
    return rows[0] || null;
  },

  /** Insertion d'une entrée de log (succès ou erreur). */
  async logEntry(entry) {
    const sql = `
      INSERT INTO ecommerce_sync_log
        (id_site, type_sync, id_article, reference_externe,
         payload_envoye_json, reponse_recue_json, statut, erreur_message, duree_ms)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`;
    const { rows } = await getPool().query(sql, [
      entry.id_site, entry.type_sync, entry.id_article || null, entry.reference_externe || null,
      entry.payload_envoye_json || null, entry.reponse_recue_json || null,
      entry.statut || 'ok', entry.erreur_message || null, entry.duree_ms || null,
    ]);
    return rows[0];
  },

  /** Chargement d'un article à pousser (§11quinquies.3). */
  async loadArticleForSync(idArticle) {
    const { rows } = await getPool().query(
      `SELECT id_article, code_article, ref_commerciale, designation,
              prix_vente_ht, ean_13, actif, image_url_principale
         FROM articles_catalogue WHERE id_article = $1 LIMIT 1`,
      [idArticle],
    );
    return rows[0] || null;
  },

  /** Chargement du stock disponible pour un article. */
  async loadStockDispo(idArticle) {
    const { rows } = await getPool().query(
      `SELECT COALESCE(SUM(quantite_dispo), 0)::numeric AS qte_dispo
         FROM stock_articles WHERE id_article = $1`,
      [idArticle],
    );
    return parseFloat(rows[0]?.qte_dispo || 0);
  },
};

export default model;
