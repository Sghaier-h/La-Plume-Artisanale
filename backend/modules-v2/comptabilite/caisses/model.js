// model.js — comptabilite/caisses (Phase A §14quater.1)
// Data-access layer : table `caisses` + vue `caisses_mouvements` (schéma 34).
import { getPool, withTransaction } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'caisses';
const PK    = 'id_caisse';

/** Liste des caisses + solde calculé = solde_initial + Σ entrées − Σ sorties */
export async function listCaisses() {
  const sql = `
    SELECT c.*,
           (c.solde_initial
              + COALESCE((SELECT SUM(CASE WHEN COALESCE(m.type_mvt, m.sens) IN ('entree','transfert_in')
                                           THEN m.montant ELSE 0 END)
                            FROM mouvements_caisse m WHERE m.id_caisse = c.id_caisse), 0)
              - COALESCE((SELECT SUM(CASE WHEN COALESCE(m.type_mvt, m.sens) IN ('sortie','transfert_out')
                                           THEN m.montant ELSE 0 END)
                            FROM mouvements_caisse m WHERE m.id_caisse = c.id_caisse), 0)
           )::NUMERIC(14,3) AS solde_calcule
      FROM ${TABLE} c
     WHERE c.actif = TRUE
     ORDER BY c.ordre ASC, c.id_caisse ASC
  `;
  const { rows } = await pool.query(sql);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return rows[0] || null;
}

export async function insert(payload) {
  const cols = Object.keys(payload);
  const vals = Object.values(payload);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const { rows } = await pool.query(sql, vals);
  return rows[0];
}

export async function updateById(id, payload) {
  const cols = Object.keys(payload);
  if (cols.length === 0) return findById(id);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const sql = `UPDATE ${TABLE} SET ${set}, updated_at = NOW() WHERE ${PK} = $${cols.length + 1} RETURNING *`;
  const { rows } = await pool.query(sql, [...Object.values(payload), id]);
  return rows[0] || null;
}

export async function softDelete(id) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE} SET actif = FALSE, updated_at = NOW() WHERE ${PK} = $1 RETURNING *`,
    [id],
  );
  return rows[0] || null;
}

/** Journal mouvements d'une caisse (vue caisses_mouvements). */
export async function listMouvements(id_caisse, { limit = 100, offset = 0, date_from, date_to } = {}) {
  const where = ['id_caisse = $1'];
  const values = [id_caisse];
  let i = 2;
  if (date_from) { where.push(`date_mouvement >= $${i++}`); values.push(date_from); }
  if (date_to)   { where.push(`date_mouvement <= $${i++}`); values.push(date_to); }
  const sql = `
    SELECT * FROM caisses_mouvements
     WHERE ${where.join(' AND ')}
     ORDER BY date_mouvement DESC, id_mouvement DESC
     LIMIT $${i++} OFFSET $${i}
  `;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

/** Transfert interne caisse source → caisse destination (atomique). */
export async function transfert({ id_caisse_source, id_caisse_dest, montant, libelle, cree_par }) {
  return withTransaction(async (client) => {
    const now = new Date().toISOString();
    const { rows: outRows } = await client.query(
      `INSERT INTO mouvements_caisse
         (id_caisse, date_mouvement, sens, type_mouvement, type_mvt, montant, libelle, cree_par, mode_paiement)
       VALUES ($1, NOW(), 'sortie', 'virement', 'transfert', $2, $3, $4, 'virement')
       RETURNING *`,
      [id_caisse_source, montant, `Transfert → ${libelle}`, cree_par],
    );
    const { rows: inRows } = await client.query(
      `INSERT INTO mouvements_caisse
         (id_caisse, date_mouvement, sens, type_mouvement, type_mvt, montant, libelle, cree_par, mode_paiement)
       VALUES ($1, NOW(), 'entree', 'virement', 'transfert', $2, $3, $4, 'virement')
       RETURNING *`,
      [id_caisse_dest, montant, `Transfert ← ${libelle}`, cree_par],
    );
    return { sortie: outRows[0], entree: inRows[0], date: now };
  });
}

/** Routage mode de paiement → caisse par défaut. */
export async function listRoutage() {
  const { rows } = await pool.query(
    `SELECT r.*, c.code AS caisse_code, c.libelle AS caisse_libelle
       FROM routage_caisse_par_mode r
       JOIN caisses c ON c.id_caisse = r.id_caisse_default
      WHERE r.actif = TRUE
      ORDER BY r.mode_paiement ASC`,
  );
  return rows;
}
