// model.js — comptabilite/compensations (Phase A §14quater.4)
import { getPool, withTransaction } from '../../_shared/db.js';
const pool = getPool();

export async function list({ statut, limit = 100, offset = 0 } = {}) {
  const where = []; const vals = []; let i = 1;
  if (statut) { where.push(`statut = $${i++}`); vals.push(statut); }
  const sql = `
    SELECT c.*,
           (SELECT COUNT(*) FROM compensations_lignes l WHERE l.id_compensation = c.id_compensation) AS nb_lignes
      FROM compensations_croisees c
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY c.date_compensation DESC, c.id_compensation DESC
     LIMIT $${i++} OFFSET $${i}
  `;
  vals.push(limit, offset);
  const { rows } = await pool.query(sql, vals);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM compensations_croisees WHERE id_compensation = $1', [id]);
  if (!rows[0]) return null;
  const { rows: lignes } = await pool.query(
    'SELECT * FROM compensations_lignes WHERE id_compensation = $1 ORDER BY id_ligne_comp',
    [id],
  );
  return { ...rows[0], lignes };
}

async function nextNumero(client) {
  const { rows } = await client.query(`
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_compensation FROM 11) AS INT)), 0) + 1 AS n
      FROM compensations_croisees
     WHERE numero_compensation LIKE 'COMP-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%'
  `);
  const seq = String(rows[0]?.n ?? 1).padStart(5, '0');
  return `COMP-${new Date().getFullYear()}-${seq}`;
}

/** Création avec les 2 lignes débit/crédit en une transaction. */
export async function create(body, user) {
  return withTransaction(async (client) => {
    const lignes = Array.isArray(body.lignes) ? body.lignes : [];
    if (lignes.length < 2) throw new Error('Au moins 2 lignes (1 débit + 1 crédit) requises');
    const totalD = lignes.filter(l => l.sens === 'debit').reduce((s, l) => s + Number(l.montant || 0), 0);
    const totalC = lignes.filter(l => l.sens === 'credit').reduce((s, l) => s + Number(l.montant || 0), 0);
    if (Math.abs(totalD - totalC) > 0.001) {
      throw new Error(`Balance invalide : débit=${totalD} ≠ crédit=${totalC}`);
    }
    const numero = body.numero_compensation || await nextNumero(client);
    const { rows: cRows } = await client.query(
      `INSERT INTO compensations_croisees
         (numero_compensation, date_compensation, libelle, montant_total, statut, cree_par, notes)
       VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, 'brouillon', $5, $6)
       RETURNING *`,
      [numero, body.date_compensation || null, body.libelle, totalD,
       user?.id_user || null, body.notes || null],
    );
    const comp = cRows[0];
    for (const l of lignes) {
      await client.query(
        `INSERT INTO compensations_lignes
           (id_compensation, sens, id_tiers, type_tiers, nom_tiers, libelle, montant, id_piece_liee, piece_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [comp.id_compensation, l.sens, l.id_tiers || null, l.type_tiers || 'autre',
         l.nom_tiers || null, l.libelle || null, Number(l.montant),
         l.id_piece_liee || null, l.piece_type || null],
      );
    }
    return findByIdInTx(client, comp.id_compensation);
  });
}

async function findByIdInTx(client, id) {
  const { rows } = await client.query('SELECT * FROM compensations_croisees WHERE id_compensation = $1', [id]);
  const { rows: lignes } = await client.query(
    'SELECT * FROM compensations_lignes WHERE id_compensation = $1 ORDER BY id_ligne_comp',
    [id],
  );
  return { ...rows[0], lignes };
}

export async function valider(id, user) {
  // Le trigger fn_check_compensation_balance vérifie la balance = 0
  const { rows } = await pool.query(
    `UPDATE compensations_croisees
        SET statut = 'validee', date_validation = NOW(), valide_par = $2, updated_at = NOW()
      WHERE id_compensation = $1 AND statut = 'brouillon'
      RETURNING *`,
    [id, user?.id_user || null],
  );
  return rows[0] || null;
}

export async function annuler(id, motif) {
  const { rows } = await pool.query(
    `UPDATE compensations_croisees
        SET statut = 'annulee', date_annulation = NOW(),
            notes = COALESCE(notes,'') || E'\n[Annulation] ' || COALESCE($2,'')
      WHERE id_compensation = $1 AND statut IN ('brouillon','validee')
      RETURNING *`,
    [id, motif || null],
  );
  return rows[0] || null;
}
