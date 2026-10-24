// model.js — rh/avances
import { getPool, withTransaction } from '../../_shared/db.js';
import { appliquerMouvement } from '../comptes-employes/model.js';
const pool = getPool();

const TABLE = 'avances_salaires';
const PK    = 'id_avance';

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    where.push(`a.${k} = $${i++}`);
    values.push(v);
  }
  const sql = `
    SELECT a.*, e.matricule, e.nom, e.prenom
      FROM ${TABLE} a
      JOIN employes e ON e.id_employe = a.id_employe
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY a.date_demande DESC, a.${PK} DESC
     LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT a.*, e.matricule, e.nom, e.prenom
       FROM ${TABLE} a
       JOIN employes e ON e.id_employe = a.id_employe
      WHERE a.${PK} = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function insert(payload, user) {
  const cols = [
    'id_employe','date_demande','montant_demande','motif',
    'modalite_remboursement','statut','cree_par',
  ];
  const vals = [
    payload.id_employe,
    payload.date_demande || new Date(),
    payload.montant_demande,
    payload.motif,
    payload.modalite_remboursement || null,
    payload.statut || 'demande',
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

export async function updateById(id, payload) {
  const allowed = [
    'date_demande', 'montant_demande', 'motif', 'modalite_remboursement',
    'statut', 'date_approbation', 'approuve_par', 'date_paiement',
    'id_paiement', 'id_caisse_source', 'solde_restant_avance', 'motif_refus',
  ];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const c of allowed) {
    if (payload[c] !== undefined) {
      sets.push(`${c} = $${i++}`);
      vals.push(payload[c]);
    }
  }
  if (!sets.length) return findById(id);
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE ${TABLE} SET ${sets.join(', ')}, updated_at = NOW()
       WHERE ${PK} = $${i} RETURNING *`,
    vals
  );
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}

export async function approuver(id, user) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut = 'approuvee',
            date_approbation = CURRENT_DATE,
            approuve_par = $1,
            updated_at = NOW()
      WHERE ${PK} = $2 AND statut = 'demande'
      RETURNING *`,
    [user?.id || null, id]
  );
  if (!rows[0]) throw new Error('Avance introuvable ou déjà traitée');
  return rows[0];
}

export async function refuser(id, motif, user) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut = 'refusee',
            motif_refus = $1,
            approuve_par = $2,
            date_approbation = CURRENT_DATE,
            updated_at = NOW()
      WHERE ${PK} = $3 AND statut = 'demande'
      RETURNING *`,
    [motif, user?.id || null, id]
  );
  if (!rows[0]) throw new Error('Avance introuvable ou déjà traitée');
  return rows[0];
}

/**
 * Paiement d'une avance approuvée : solde employé décrémenté + mouvement.
 */
export async function payer(id, { id_caisse_source, id_paiement }, user) {
  return withTransaction(async (client) => {
    const { rows: [av] } = await client.query(
      `SELECT * FROM ${TABLE} WHERE ${PK} = $1 FOR UPDATE`,
      [id]
    );
    if (!av) throw new Error('Avance introuvable');
    if (av.statut !== 'approuvee') throw new Error('Avance non approuvée');

    await client.query(
      `UPDATE ${TABLE}
          SET statut = 'payee',
              date_paiement = CURRENT_DATE,
              id_caisse_source = $1,
              id_paiement = $2,
              solde_restant_avance = $3,
              updated_at = NOW()
        WHERE ${PK} = $4`,
      [id_caisse_source || null, id_paiement || null, av.montant_demande, id]
    );
    return { id_avance: id, statut: 'payee' };
  }).then(async () => {
    // Création du mouvement de compte employé via API dédiée
    const av = await findById(id);
    await appliquerMouvement({
      idEmploye: av.id_employe,
      typeMvt: 'avance',
      sens: 'D',
      montant: av.montant_demande,
      libelle: `Avance ${av.motif ? '— ' + av.motif : ''}`,
      idAvance: av.id_avance,
      creePar: user?.id || null,
    });
    return av;
  });
}

/**
 * Remboursement partiel ou total d'une avance.
 */
export async function rembourser(id, { montant }, user) {
  return withTransaction(async (client) => {
    const { rows: [av] } = await client.query(
      `SELECT * FROM ${TABLE} WHERE ${PK} = $1 FOR UPDATE`,
      [id]
    );
    if (!av) throw new Error('Avance introuvable');
    if (!['payee', 'remboursee_partiel'].includes(av.statut)) {
      throw new Error('Avance non remboursable (statut=' + av.statut + ')');
    }
    const nouveauRestant = Number(av.solde_restant_avance) - Number(montant);
    const nouveauStatut = nouveauRestant <= 0 ? 'remboursee_total' : 'remboursee_partiel';

    await client.query(
      `UPDATE ${TABLE}
          SET solde_restant_avance = $1,
              statut = $2,
              updated_at = NOW()
        WHERE ${PK} = $3`,
      [Math.max(nouveauRestant, 0), nouveauStatut, id]
    );
    return { id_avance: id, nouveau_restant: Math.max(nouveauRestant, 0), statut: nouveauStatut };
  }).then(async (res) => {
    const av = await findById(id);
    await appliquerMouvement({
      idEmploye: av.id_employe,
      typeMvt: 'remboursement_avance',
      sens: 'C',
      montant,
      libelle: `Remboursement avance #${id}`,
      idAvance: id,
      creePar: user?.id || null,
    });
    return res;
  });
}
