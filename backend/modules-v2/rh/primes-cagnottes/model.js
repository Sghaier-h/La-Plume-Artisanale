// model.js — rh/primes-cagnottes
// Data-access layer for table `primes_cagnottes_semaine` + calculs agrégés
// scores et création atomique des bordereaux hors bulletin.
import { getPool, withTransaction } from '../../_shared/db.js';

const pool  = getPool();
const TABLE = 'primes_cagnottes_semaine';
const PK    = 'id_cagnotte';

const ALLOWED_COLS = new Set([
  'annee','numero_semaine','atelier','montant_dt',
  'total_scores_equipe','nb_employes_eligibles','montant_reparti_dt',
  'statut','date_calcul','date_validation','date_paiement',
  'valide_par','paye_par','cree_par',
]);

function pickCols(payload) {
  const out = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (ALLOWED_COLS.has(k) && v !== undefined) out[k] = v;
  }
  return out;
}

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    if (!ALLOWED_COLS.has(k)) continue;
    where.push(`${k} = $${i++}`);
    values.push(v);
  }
  const sql = `SELECT * FROM ${TABLE}
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY annee DESC, numero_semaine DESC, atelier
               LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1 LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function insert(payload) {
  const data = pickCols(payload);
  const cols = Object.keys(data);
  if (!cols.length) throw new Error('Payload vide');
  const vals = Object.values(data);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const { rows } = await pool.query(sql, vals);
  return rows[0];
}

export async function updateById(id, payload) {
  const data = pickCols(payload);
  const cols = Object.keys(data);
  if (!cols.length) return findById(id);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const sql = `UPDATE ${TABLE} SET ${set} WHERE ${PK} = $${cols.length + 1} RETURNING *`;
  const { rows } = await pool.query(sql, [...Object.values(data), id]);
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}

/**
 * Agrège les scores de la semaine pour un atelier et met à jour la cagnotte.
 * Utilise l'ISO week (aligné avec le stockage numero_semaine 1..53).
 * @returns {{cagnotte, total_scores, nb_eligibles, details:Array}}
 */
export async function calculerCagnotte(idCagnotte) {
  return withTransaction(async (client) => {
    const cagRes = await client.query(
      `SELECT * FROM ${TABLE} WHERE ${PK} = $1 FOR UPDATE`,
      [idCagnotte]
    );
    const cagnotte = cagRes.rows[0];
    if (!cagnotte) throw new Error('Cagnotte introuvable');
    if (cagnotte.statut === 'validee' || cagnotte.statut === 'payee') {
      throw new Error(`Cagnotte déjà ${cagnotte.statut}`);
    }

    const scoresRes = await client.query(
      `SELECT s.id_employe,
              COALESCE(SUM(s.score_global), 0)::numeric(10,3) AS score_total
         FROM primes_scores_journaliers s
        WHERE s.atelier = $1
          AND EXTRACT(ISOYEAR FROM s.date_journee) = $2
          AND EXTRACT(WEEK    FROM s.date_journee) = $3
        GROUP BY s.id_employe
        HAVING COALESCE(SUM(s.score_global), 0) > 0
        ORDER BY score_total DESC`,
      [cagnotte.atelier, cagnotte.annee, cagnotte.numero_semaine]
    );
    const details = scoresRes.rows;
    const total   = details.reduce((a, r) => a + Number(r.score_total), 0);
    const nb      = details.length;

    const up = await client.query(
      `UPDATE ${TABLE}
          SET total_scores_equipe = $2,
              nb_employes_eligibles = $3,
              statut = 'calculee',
              date_calcul = NOW()
        WHERE ${PK} = $1
        RETURNING *`,
      [idCagnotte, total, nb]
    );
    return {
      cagnotte: up.rows[0],
      total_scores: total,
      nb_eligibles: nb,
      details,
    };
  });
}

/**
 * Valide la cagnotte : statut → 'validee' + crée un bordereau par employé
 * éligible (score > 0). Répartition proportionnelle.
 * Numéro bordereau : BOR-{YYYY}-{seq:6} scoped par année (lock table).
 */
export async function validerCagnotte(idCagnotte, user) {
  return withTransaction(async (client) => {
    const cagRes = await client.query(
      `SELECT * FROM ${TABLE} WHERE ${PK} = $1 FOR UPDATE`,
      [idCagnotte]
    );
    const cag = cagRes.rows[0];
    if (!cag) throw new Error('Cagnotte introuvable');
    if (cag.statut !== 'calculee') {
      throw new Error(`Statut ${cag.statut} : passer par /calculer d'abord`);
    }

    const scoresRes = await client.query(
      `SELECT s.id_employe,
              COALESCE(SUM(s.score_global), 0)::numeric(10,3) AS score_total
         FROM primes_scores_journaliers s
        WHERE s.atelier = $1
          AND EXTRACT(ISOYEAR FROM s.date_journee) = $2
          AND EXTRACT(WEEK    FROM s.date_journee) = $3
        GROUP BY s.id_employe
        HAVING COALESCE(SUM(s.score_global), 0) > 0`,
      [cag.atelier, cag.annee, cag.numero_semaine]
    );
    const details = scoresRes.rows;
    if (!details.length) throw new Error('Aucun score éligible sur la semaine');

    const totalScores = details.reduce((a, r) => a + Number(r.score_total), 0);
    if (totalScores <= 0) throw new Error('Total des scores nul');

    const annee = cag.annee;
    // Séquence numéro bordereau : lock advisory sur la table pour éviter races.
    await client.query('LOCK TABLE primes_bordereaux_hors_bulletin IN SHARE ROW EXCLUSIVE MODE');
    const seqRes = await client.query(
      `SELECT COUNT(*)::int AS nb FROM primes_bordereaux_hors_bulletin
         WHERE numero_bordereau LIKE $1`,
      [`BOR-${annee}-%`]
    );
    let seq = seqRes.rows[0].nb;

    const bordereaux = [];
    let totalReparti = 0;
    for (const d of details) {
      seq += 1;
      const numero = `BOR-${annee}-${String(seq).padStart(6, '0')}`;
      const montant = Number(
        ((Number(d.score_total) / totalScores) * Number(cag.montant_dt)).toFixed(3)
      );
      totalReparti += montant;
      const ins = await client.query(
        `INSERT INTO primes_bordereaux_hors_bulletin
           (numero_bordereau, id_cagnotte, id_employe,
            score_total_semaine, montant_dt, mode_versement,
            compte_comptable, statut)
         VALUES ($1, $2, $3, $4, $5, 'especes', '648', 'a_verser')
         RETURNING *`,
        [numero, cag.id_cagnotte, d.id_employe, d.score_total, montant]
      );
      bordereaux.push(ins.rows[0]);
    }

    const up = await client.query(
      `UPDATE ${TABLE}
          SET statut = 'validee',
              date_validation = NOW(),
              valide_par = $2,
              montant_reparti_dt = $3
        WHERE ${PK} = $1
        RETURNING *`,
      [idCagnotte, user?.id_user || null, totalReparti]
    );
    return { cagnotte: up.rows[0], bordereaux };
  });
}

/**
 * Marque la cagnotte comme payée (tous les bordereaux versés).
 */
export async function marquerPayee(idCagnotte, user) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut = 'payee',
            date_paiement = NOW(),
            paye_par = $2
      WHERE ${PK} = $1
        AND statut IN ('validee')
      RETURNING *`,
    [idCagnotte, user?.id_user || null]
  );
  if (!rows[0]) throw new Error('Cagnotte non trouvée ou statut invalide (doit être validee)');
  return rows[0];
}
