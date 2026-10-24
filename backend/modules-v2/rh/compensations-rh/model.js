// model.js — rh/compensations-rh
import { getPool, withTransaction } from '../../_shared/db.js';
import { appliquerMouvement } from '../comptes-employes/model.js';
const pool = getPool();

const TABLE = 'compensations_rh';
const PK    = 'id_comp_rh';

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    where.push(`c.${k} = $${i++}`);
    values.push(v);
  }
  const sql = `
    SELECT c.*, e.matricule, e.nom, e.prenom
      FROM ${TABLE} c
      JOIN employes e ON e.id_employe = c.id_employe
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY c.date_compensation DESC, c.${PK} DESC
     LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT c.*, e.matricule, e.nom, e.prenom
       FROM ${TABLE} c
       JOIN employes e ON e.id_employe = c.id_employe
      WHERE c.${PK} = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function insert(payload, user) {
  const cols = ['id_employe','date_compensation','type_compensation',
                'montant_a_compenser','source','id_compensation_croisee_liee',
                'motif','cree_par'];
  const vals = [
    payload.id_employe,
    payload.date_compensation || new Date(),
    payload.type_compensation,
    payload.montant_a_compenser,
    payload.source,
    payload.id_compensation_croisee_liee || null,
    payload.motif || null,
    user?.id || null,
  ];
  const { rows } = await pool.query(
    `INSERT INTO ${TABLE} (${cols.join(',')})
     VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')})
     RETURNING *`,
    vals
  );
  return rows[0];
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM ${TABLE} WHERE ${PK} = $1 AND statut = 'en_attente'`,
    [id]
  );
  return { deleted: rowCount };
}

/**
 * Applique la compensation : crée le mouvement associé sur compte employé.
 * Sens C ou D selon le type de compensation (CNSS/IRPP → D sur salaire,
 * acompte privé → D, apport_gerant → C).
 */
export async function appliquer(id, user) {
  return withTransaction(async (client) => {
    const { rows: [c] } = await client.query(
      `SELECT * FROM ${TABLE} WHERE ${PK} = $1 FOR UPDATE`, [id]
    );
    if (!c) throw new Error('Compensation introuvable');
    if (c.statut !== 'en_attente') throw new Error('Compensation déjà appliquée');

    await client.query(
      `UPDATE ${TABLE}
          SET statut = 'appliquee',
              date_application = NOW(),
              applique_par = $1,
              updated_at = NOW()
        WHERE ${PK} = $2`,
      [user?.id || null, id]
    );
    return c;
  }).then(async (c) => {
    // CNSS, IRPP, acompte_prive, avance_remboursement → débit (retenu)
    // autre → sens configurable (par défaut D)
    const sens = 'D';
    await appliquerMouvement({
      idEmploye: c.id_employe,
      typeMvt: 'compensation',
      sens,
      montant: c.montant_a_compenser,
      libelle: `Compensation ${c.type_compensation} (source=${c.source})${c.motif ? ' — ' + c.motif : ''}`,
      idCompensation: c.id_comp_rh,
      creePar: user?.id || null,
    });
    return findById(id);
  });
}

export async function annuler(id, user) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut = 'annulee',
            applique_par = $1,
            date_application = NOW(),
            updated_at = NOW()
      WHERE ${PK} = $2 AND statut = 'en_attente'
      RETURNING *`,
    [user?.id || null, id]
  );
  if (!rows[0]) throw new Error('Compensation introuvable ou déjà traitée');
  return rows[0];
}
