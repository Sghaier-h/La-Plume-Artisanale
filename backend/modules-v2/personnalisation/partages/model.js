// model.js — personnalisation/partages
// Data-access sur `personnalisations_partages` (§5.8.8 : bouton "Partager mon design").
import { getPool } from '../../_shared/db.js';

const pool = { query: (t, p) => getPool().query(t, p) };

export const model = {
  async findByCode(code) {
    const { rows } = await pool.query(
      `SELECT * FROM personnalisations_partages WHERE code_court = $1 LIMIT 1`,
      [code],
    );
    return rows[0] || null;
  },

  async insert({
    code_court,
    id_config = null,
    parametres_snapshot,
    preview_url = null,
    canal_partage = null,
    ip_createur = null,
    date_expiration = null,
  }) {
    const { rows } = await pool.query(
      `INSERT INTO personnalisations_partages
         (code_court, id_config, parametres_snapshot, preview_url,
          canal_partage, ip_createur, date_expiration)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6,
               COALESCE($7, NOW() + INTERVAL '90 days'))
       RETURNING *`,
      [
        code_court,
        id_config,
        JSON.stringify(parametres_snapshot || {}),
        preview_url,
        canal_partage,
        ip_createur,
        date_expiration,
      ],
    );
    return rows[0];
  },

  /**
   * Incrémente le compteur de vues + renvoie la ligne à jour (une seule requête).
   */
  async incrementVues(code) {
    const { rows } = await pool.query(
      `UPDATE personnalisations_partages
          SET nb_vues = nb_vues + 1
        WHERE code_court = $1
        RETURNING *`,
      [code],
    );
    return rows[0] || null;
  },

  async incrementConversions(code) {
    const { rows } = await pool.query(
      `UPDATE personnalisations_partages
          SET nb_conversions_panier = nb_conversions_panier + 1
        WHERE code_court = $1
        RETURNING *`,
      [code],
    );
    return rows[0] || null;
  },
};

export default model;
