// model.js — personnalisation/referentiels
// Lecture seule des 3 référentiels du configurateur : zones, polices, fils.
import { getPool } from '../../_shared/db.js';

const pool = { query: (t, p) => getPool().query(t, p) };

export const model = {
  async listZones({ actifOnly = true } = {}) {
    const sql = `SELECT * FROM personnalisation_zones
                  ${actifOnly ? 'WHERE actif = TRUE' : ''}
                  ORDER BY ordre_affichage ASC, id_zone ASC`;
    const { rows } = await pool.query(sql, []);
    return rows;
  },

  async listPolices({ actifOnly = true } = {}) {
    const sql = `SELECT * FROM personnalisation_polices
                  ${actifOnly ? 'WHERE actif = TRUE' : ''}
                  ORDER BY nom_affichage ASC`;
    const { rows } = await pool.query(sql, []);
    return rows;
  },

  async listFilsCouleurs({ actifOnly = true, marque = null } = {}) {
    const clauses = [];
    const params = [];
    let i = 1;
    if (actifOnly) clauses.push('actif = TRUE');
    if (marque)    { clauses.push(`marque = $${i++}`); params.push(marque); }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT * FROM personnalisation_fils_couleurs
                  ${whereSql}
                  ORDER BY marque ASC, reference ASC`;
    const { rows } = await pool.query(sql, params);
    return rows;
  },
};

export default model;
