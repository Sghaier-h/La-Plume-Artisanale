// model.js — rh/ajustements
// Génération automatique de code AJ-{NOM}-{YYYY}-{NN} et application d'un
// ajustement avec double validation (créer → valider).
import { getPool, withTransaction } from '../../_shared/db.js';
import { appliquerMouvement } from '../comptes-employes/model.js';
const pool = getPool();

const TABLE = 'ajustements_comptes_rh';
const PK    = 'id_ajustement';

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
     ORDER BY a.date_ajustement DESC, a.${PK} DESC
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

/**
 * Génère un code AJ-{NOM}-{YYYY}-{NN} unique.
 * Scanne la dernière séquence par (nom, année) et incrémente.
 */
async function genCode(idEmploye, dateAjustement, client) {
  const q = client ? ((t, p) => client.query(t, p)) : ((t, p) => pool.query(t, p));
  const { rows: [emp] } = await q(
    `SELECT UPPER(regexp_replace(nom, '[^A-Za-z]', '', 'g')) AS nom_upper
       FROM employes WHERE id_employe = $1`,
    [idEmploye]
  );
  if (!emp) throw new Error(`Employé ${idEmploye} introuvable`);
  const annee = new Date(dateAjustement || Date.now()).getFullYear();
  const prefix = `AJ-${emp.nom_upper}-${annee}-`;

  const { rows: [last] } = await q(
    `SELECT code_ajustement FROM ${TABLE}
      WHERE code_ajustement LIKE $1
      ORDER BY code_ajustement DESC LIMIT 1`,
    [prefix + '%']
  );
  let n = 1;
  if (last) {
    const m = /-(\d+)$/.exec(last.code_ajustement);
    if (m) n = parseInt(m[1], 10) + 1;
  }
  return `${prefix}${String(n).padStart(2, '0')}`;
}

export async function insert(payload, user) {
  if (!payload.id_employe) throw new Error('id_employe requis');
  if (!payload.montant) throw new Error('montant requis');
  if (!payload.motif) throw new Error('motif requis');
  if (!payload.type_ajustement) throw new Error('type_ajustement requis');

  return withTransaction(async (client) => {
    const code = payload.code_ajustement || await genCode(payload.id_employe, payload.date_ajustement, client);

    // Snapshot ancienne valeur
    const { rows: [emp] } = await client.query(
      `SELECT solde_courant FROM employes WHERE id_employe = $1`,
      [payload.id_employe]
    );
    const anc = emp?.solde_courant ?? 0;
    const nouv = payload.type_ajustement === 'reset_zero'
      ? 0
      : (payload.nouvelle_valeur ?? (Number(anc) + Number(payload.montant)));

    const { rows: [row] } = await client.query(
      `INSERT INTO ${TABLE} (
         code_ajustement, id_employe, date_ajustement, montant, motif,
         type_ajustement, ancienne_valeur, nouvelle_valeur, cree_par, statut_validation
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'en_attente')
       RETURNING *`,
      [code, payload.id_employe, payload.date_ajustement || new Date(),
       payload.montant, payload.motif, payload.type_ajustement,
       anc, nouv, user?.id || null]
    );
    return row;
  });
}

export async function valider(id, user) {
  return withTransaction(async (client) => {
    const { rows: [a] } = await client.query(
      `SELECT * FROM ${TABLE} WHERE ${PK} = $1 FOR UPDATE`,
      [id]
    );
    if (!a) throw new Error('Ajustement introuvable');
    if (a.statut_validation !== 'en_attente') throw new Error('Ajustement déjà traité');
    if (a.cree_par && user?.id && Number(a.cree_par) === Number(user.id)) {
      throw new Error('Double validation : le validateur doit être différent du créateur');
    }
    await client.query(
      `UPDATE ${TABLE}
          SET statut_validation = 'validee',
              valide_par = $1,
              date_validation = NOW(),
              updated_at = NOW()
        WHERE ${PK} = $2`,
      [user?.id || null, id]
    );
    return a;
  }).then(async (a) => {
    // Appliquer le mouvement : sens C si montant > 0, D si montant < 0.
    const sens = Number(a.montant) >= 0 ? 'C' : 'D';
    const montantAbs = Math.abs(Number(a.montant));
    await appliquerMouvement({
      idEmploye: a.id_employe,
      typeMvt: 'ajustement',
      sens,
      montant: montantAbs,
      libelle: `${a.code_ajustement} — ${a.motif}`,
      idAjustement: a.id_ajustement,
      creePar: user?.id || null,
    });
    return findById(id);
  });
}

export async function rejeter(id, motif, user) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut_validation = 'rejetee',
            motif_rejet = $1,
            valide_par = $2,
            date_validation = NOW(),
            updated_at = NOW()
      WHERE ${PK} = $3 AND statut_validation = 'en_attente'
      RETURNING *`,
    [motif, user?.id || null, id]
  );
  if (!rows[0]) throw new Error('Ajustement introuvable ou déjà traité');
  return rows[0];
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM ${TABLE} WHERE ${PK} = $1 AND statut_validation = 'en_attente'`,
    [id]
  );
  return { deleted: rowCount };
}
