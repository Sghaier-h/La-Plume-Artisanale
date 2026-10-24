// model.js — rh/comptes-employes
// Vue consolidée du compte employé (`employes.solde_courant` + historique
// `comptes_employes_mouvements`). Utilise le pool pg partagé.
import { getPool, withTransaction } from '../../_shared/db.js';
const pool = getPool();

export async function listComptes({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  if (filters.statut) {
    where.push(`statut = $${i++}`);
    values.push(filters.statut);
  }
  if (filters.q) {
    where.push(`(nom ILIKE $${i} OR prenom ILIKE $${i} OR matricule ILIKE $${i})`);
    values.push(`%${filters.q}%`);
    i++;
  }
  if (filters.solde === 'negatif') where.push('solde_courant < 0');
  if (filters.solde === 'positif') where.push('solde_courant > 0');
  if (filters.solde === 'zero')    where.push('solde_courant = 0');

  const sql = `
    SELECT id_employe, matricule, nom, prenom, statut,
           solde_courant, date_dernier_mouvement,
           rib_bancaire, banque, caisse_defaut_paiement_salaire
      FROM employes
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY nom, prenom
     LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findSoldeById(id) {
  const { rows } = await pool.query(
    `SELECT id_employe, matricule, nom, prenom, solde_courant,
            date_dernier_mouvement, rib_bancaire, banque,
            caisse_defaut_paiement_salaire
       FROM employes WHERE id_employe = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function listMouvements(idEmploye, { limit = 100, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT * FROM comptes_employes_mouvements
      WHERE id_employe = $1
      ORDER BY date_mouvement DESC, id_mouvement_emp DESC
      LIMIT $2 OFFSET $3`,
    [idEmploye, limit, offset]
  );
  return rows;
}

/**
 * Ajuste le solde d'un employé (crédit/débit) + crée la ligne mouvement.
 * Transactionnel pour garantir la cohérence solde/mouvement.
 */
export async function appliquerMouvement({
  idEmploye,
  typeMvt,
  sens,
  montant,
  libelle,
  idBulletin = null,
  idPaiement = null,
  idAvance = null,
  idAjustement = null,
  idCompensation = null,
  creePar = null,
}) {
  return withTransaction(async (client) => {
    const { rows: [emp] } = await client.query(
      `SELECT solde_courant FROM employes WHERE id_employe = $1 FOR UPDATE`,
      [idEmploye]
    );
    if (!emp) throw new Error(`Employé ${idEmploye} introuvable`);

    const delta = sens === 'C' ? Number(montant) : -Number(montant);
    const nouveauSolde = Number(emp.solde_courant) + delta;

    await client.query(
      `UPDATE employes
          SET solde_courant = $1,
              date_dernier_mouvement = NOW(),
              updated_at = NOW()
        WHERE id_employe = $2`,
      [nouveauSolde, idEmploye]
    );

    const { rows: [mvt] } = await client.query(
      `INSERT INTO comptes_employes_mouvements (
         id_employe, type_mvt, sens, montant, libelle,
         id_bulletin, id_paiement, id_avance, id_ajustement, id_compensation,
         solde_apres, cree_par
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [idEmploye, typeMvt, sens, montant, libelle,
       idBulletin, idPaiement, idAvance, idAjustement, idCompensation,
       nouveauSolde, creePar]
    );
    return { mouvement: mvt, nouveauSolde };
  });
}

export async function updateCompte(id, payload) {
  const allowed = ['rib_bancaire', 'banque', 'caisse_defaut_paiement_salaire'];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const k of allowed) {
    if (payload[k] !== undefined) {
      sets.push(`${k} = $${i++}`);
      vals.push(payload[k]);
    }
  }
  if (!sets.length) return findSoldeById(id);
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE employes SET ${sets.join(', ')}, updated_at = NOW()
      WHERE id_employe = $${i} RETURNING *`,
    vals
  );
  return rows[0] || null;
}

export async function kpiSoldes() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int AS total_employes,
      COUNT(*) FILTER (WHERE solde_courant < 0)::int AS nb_negatif,
      COUNT(*) FILTER (WHERE solde_courant > 0)::int AS nb_positif,
      COUNT(*) FILTER (WHERE solde_courant = 0)::int AS nb_zero,
      COALESCE(SUM(solde_courant), 0)::numeric AS solde_total,
      COALESCE(SUM(CASE WHEN solde_courant > 0 THEN solde_courant END), 0)::numeric AS montant_du_total,
      COALESCE(SUM(CASE WHEN solde_courant < 0 THEN -solde_courant END), 0)::numeric AS montant_debiteur_total
    FROM employes
    WHERE statut = 'actif'
  `);
  return rows[0];
}
