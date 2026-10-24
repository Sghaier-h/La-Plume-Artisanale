// model.js — comptabilite/rapprochement bancaire (Phase A §14quater)
import { getPool, withTransaction } from '../../_shared/db.js';
const pool = getPool();

export async function listImports() {
  const { rows } = await pool.query(`
    SELECT i.*,
           (SELECT COUNT(*) FROM rapprochement_bancaire_lignes l WHERE l.id_import_bq = i.id_import_bq) AS nb_lignes,
           (SELECT COUNT(*) FROM rapprochement_bancaire_lignes l WHERE l.id_import_bq = i.id_import_bq AND l.matching_statut = 'rapproche')  AS nb_rapprochees,
           (SELECT COUNT(*) FROM rapprochement_bancaire_lignes l WHERE l.id_import_bq = i.id_import_bq AND l.matching_statut = 'non_matche') AS nb_non_matchees
      FROM rapprochement_bancaire_imports i
     ORDER BY i.date_import DESC
     LIMIT 50
  `);
  return rows;
}

export async function listLignes({ id_import_bq, matching_statut, limit = 500 } = {}) {
  const where = []; const vals = []; let i = 1;
  if (id_import_bq)     { where.push(`id_import_bq = $${i++}`);     vals.push(id_import_bq); }
  if (matching_statut)  { where.push(`matching_statut = $${i++}`);  vals.push(matching_statut); }
  const sql = `
    SELECT * FROM rapprochement_bancaire_lignes
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY date_valeur ASC, id_ligne_bq ASC
     LIMIT $${i}
  `;
  vals.push(limit);
  const { rows } = await pool.query(sql, vals);
  return rows;
}

export async function createImport({ id_compte_bancaire, fichier_source, format, lignes = [] }, user) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO rapprochement_bancaire_imports
         (id_compte_bancaire, fichier_source, format, nb_lignes_total, importe_par)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_compte_bancaire || null, fichier_source, format,
       lignes.length, user?.id_user || null],
    );
    const imp = rows[0];
    for (const l of lignes) {
      await client.query(
        `INSERT INTO rapprochement_bancaire_lignes
           (id_import_bq, date_valeur, libelle_bq, montant_debit, montant_credit, reference_bq)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [imp.id_import_bq, l.date_valeur, l.libelle_bq,
         Number(l.montant_debit || 0), Number(l.montant_credit || 0),
         l.reference_bq || null],
      );
    }
    return imp;
  });
}

/**
 * Matching heuristique : associe les lignes à des écritures bancaires du
 * journal comptable par montant + date (±3 jours) + libellé.
 * Comme la jointure réelle dépend de 19_compta/16_ventes, on marque ici
 * les lignes 'suggere' en se basant sur ventes_paiements à date proche
 * et montant exact, et laisse l'utilisateur confirmer.
 */
export async function matchingAuto(id_import_bq) {
  return withTransaction(async (client) => {
    const { rows: lignes } = await client.query(
      `SELECT * FROM rapprochement_bancaire_lignes
        WHERE id_import_bq = $1 AND matching_statut = 'non_matche'`,
      [id_import_bq],
    );
    let suggeres = 0;
    for (const l of lignes) {
      // heuristique : montant exact dans table paiements à ±3j
      const montant = Math.max(Number(l.montant_debit || 0), Number(l.montant_credit || 0));
      let match = null;
      try {
        const { rows } = await client.query(
          `SELECT id_paiement AS id_ecriture, 85 AS score
             FROM paiements
            WHERE ABS(montant - $1) < 0.01
              AND date_paiement BETWEEN $2::date - INTERVAL '3 days' AND $2::date + INTERVAL '3 days'
            LIMIT 1`,
          [montant, l.date_valeur],
        );
        match = rows[0] || null;
      } catch { /* table paiements non disponible, pas d'erreur */ }
      if (match) {
        await client.query(
          `UPDATE rapprochement_bancaire_lignes
              SET matching_statut = 'suggere',
                  id_mouvement_journal_matche = $2,
                  score_matching = $3
            WHERE id_ligne_bq = $1`,
          [l.id_ligne_bq, match.id_ecriture, match.score],
        );
        suggeres++;
      }
    }
    return { nb_suggestions: suggeres, nb_total: lignes.length };
  });
}

export async function rapprocher(id_ligne_bq, { id_mouvement_journal_matche }, user) {
  const { rows } = await pool.query(
    `UPDATE rapprochement_bancaire_lignes
        SET matching_statut = 'rapproche',
            id_mouvement_journal_matche = $2,
            score_matching = COALESCE(score_matching, 100),
            date_rapprochement = NOW(),
            rapproche_par = $3
      WHERE id_ligne_bq = $1
      RETURNING *`,
    [id_ligne_bq, id_mouvement_journal_matche, user?.id_user || null],
  );
  if (rows[0]) {
    await pool.query(
      `UPDATE rapprochement_bancaire_imports
          SET nb_lignes_rapprochees = (
            SELECT COUNT(*) FROM rapprochement_bancaire_lignes
             WHERE id_import_bq = $1 AND matching_statut = 'rapproche'
          )
        WHERE id_import_bq = $1`,
      [rows[0].id_import_bq],
    );
  }
  return rows[0] || null;
}

export async function ignorer(id_ligne_bq) {
  const { rows } = await pool.query(
    `UPDATE rapprochement_bancaire_lignes
        SET matching_statut = 'ignore'
      WHERE id_ligne_bq = $1
      RETURNING *`,
    [id_ligne_bq],
  );
  return rows[0] || null;
}
