// model.js — comptabilite/dossiers-import (Phase A §14quater.2)
import { getPool, withTransaction } from '../../_shared/db.js';
const pool = getPool();

export async function list({ statut, pays, limit = 100, offset = 0 } = {}) {
  const where = []; const vals = []; let i = 1;
  if (statut) { where.push(`statut = $${i++}`); vals.push(statut); }
  if (pays)   { where.push(`pays_origine ILIKE $${i++}`); vals.push(`%${pays}%`); }
  const sql = `
    SELECT d.*,
           (SELECT COUNT(*) FROM dossiers_import_lignes l WHERE l.id_dossier = d.id_dossier) AS nb_lignes,
           (SELECT COUNT(*) FROM dossiers_import_frais  f WHERE f.id_dossier = d.id_dossier) AS nb_frais,
           (SELECT COALESCE(SUM(montant_dt),0) FROM dossiers_import_frais f WHERE f.id_dossier = d.id_dossier) AS total_frais_dt
      FROM dossiers_import d
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY d.date_ouverture DESC, d.id_dossier DESC
     LIMIT $${i++} OFFSET $${i}
  `;
  vals.push(limit, offset);
  const { rows } = await pool.query(sql, vals);
  return rows;
}

export async function kpi() {
  const { rows } = await pool.query(`
    SELECT COUNT(*)                              FILTER (WHERE statut IN ('ouvert','en_douane','arrive'))  AS ouverts,
           COUNT(*)                              FILTER (WHERE statut = 'en_douane')                       AS en_douane,
           COALESCE(SUM(poids_total_kg), 0)                                                                AS poids_total_kg,
           COALESCE(SUM(cout_total_dt), 0)                                                                 AS cout_cumule_dt
      FROM dossiers_import
     WHERE date_ouverture >= date_trunc('year', CURRENT_DATE)
  `);
  return rows[0];
}

export async function findById(id) {
  const { rows: dossiers } = await pool.query('SELECT * FROM dossiers_import WHERE id_dossier = $1', [id]);
  if (!dossiers[0]) return null;
  const { rows: lignes } = await pool.query('SELECT * FROM dossiers_import_lignes WHERE id_dossier = $1 ORDER BY id_ligne', [id]);
  const { rows: frais }  = await pool.query('SELECT * FROM dossiers_import_frais  WHERE id_dossier = $1 ORDER BY id_frais', [id]);
  const { rows: cessions }= await pool.query('SELECT * FROM cessions_intragroupe   WHERE id_dossier_import = $1 ORDER BY id_cession', [id]);
  return { ...dossiers[0], lignes, frais, cessions };
}

export async function nextNumero() {
  const { rows } = await pool.query(`
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_dossier FROM 10) AS INT)), 0) + 1 AS n
      FROM dossiers_import
     WHERE numero_dossier LIKE 'IMP-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%'
  `);
  const seq = String(rows[0]?.n ?? 1).padStart(5, '0');
  return `IMP-${new Date().getFullYear()}-${seq}`;
}

export async function create(body, user) {
  const numero = body.numero_dossier || await nextNumero();
  const { rows } = await pool.query(
    `INSERT INTO dossiers_import
      (numero_dossier, date_ouverture, pays_origine, fournisseur_etranger,
       nb_colis, poids_total_kg, incoterm, devise_etrangere, taux_change,
       cout_total_dt, statut, numero_declaration_douane, date_dedouanement, notes, cree_par)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [numero, body.date_ouverture || new Date(),
     body.pays_origine, body.fournisseur_etranger,
     body.nb_colis || null, body.poids_total_kg || null,
     body.incoterm || null, body.devise_etrangere || 'EUR',
     body.taux_change || null, body.cout_total_dt || 0,
     body.statut || 'ouvert', body.numero_declaration_douane || null,
     body.date_dedouanement || null, body.notes || null,
     user?.id_user || null],
  );
  return rows[0];
}

export async function update(id, body) {
  const allowed = ['pays_origine','fournisseur_etranger','nb_colis','poids_total_kg',
                   'incoterm','devise_etrangere','taux_change','cout_total_dt','statut',
                   'numero_declaration_douane','date_dedouanement','notes'];
  const sets = []; const vals = []; let i = 1;
  for (const k of allowed) if (k in body) { sets.push(`${k} = $${i++}`); vals.push(body[k]); }
  if (sets.length === 0) return findById(id);
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE dossiers_import SET ${sets.join(', ')}, updated_at = NOW() WHERE id_dossier = $${i} RETURNING *`,
    vals,
  );
  return rows[0] || null;
}

export async function addLigne(id_dossier, body) {
  const { rows } = await pool.query(
    `INSERT INTO dossiers_import_lignes
       (id_dossier, description_marchandise, quantite, unite, poids_kg,
        prix_unitaire_devise, montant_devise, cout_prorata_kg, id_article)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [id_dossier, body.description_marchandise, Number(body.quantite || 0),
     body.unite || 'kg', body.poids_kg || null,
     body.prix_unitaire_devise || null, body.montant_devise || null,
     body.cout_prorata_kg || null, body.id_article || null],
  );
  return rows[0];
}

export async function addFrais(id_dossier, body) {
  const { rows } = await pool.query(
    `INSERT INTO dossiers_import_frais
       (id_dossier, type_frais, libelle, montant_dt, repartition_prorata, date_frais)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [id_dossier, body.type_frais, body.libelle || null,
     Number(body.montant_dt || 0),
     body.repartition_prorata !== false,
     body.date_frais || new Date()],
  );
  return rows[0];
}

/** Recalcul des cessions LP→CAPSCOR : cout_prorata_kg + marge appliqués. */
export async function recalculerCessions(id_dossier, { marge_pct = 5 } = {}, user) {
  return withTransaction(async (client) => {
    const { rows: dRows } = await client.query('SELECT * FROM dossiers_import WHERE id_dossier = $1', [id_dossier]);
    const dossier = dRows[0];
    if (!dossier) throw new Error('Dossier introuvable');

    const { rows: lignes } = await client.query(
      'SELECT * FROM dossiers_import_lignes WHERE id_dossier = $1', [id_dossier],
    );
    const { rows: frais } = await client.query(
      `SELECT COALESCE(SUM(montant_dt),0) AS total_prorata
         FROM dossiers_import_frais
        WHERE id_dossier = $1 AND repartition_prorata = TRUE`,
      [id_dossier],
    );
    const poids_total = lignes.reduce((s, l) => s + Number(l.poids_kg || 0), 0) || 1;
    const totalProrata = Number(frais[0].total_prorata || 0);

    for (const l of lignes) {
      const cout_kg = ((Number(l.montant_devise || 0) * Number(dossier.taux_change || 1)) + totalProrata * (Number(l.poids_kg || 0) / poids_total)) / Math.max(Number(l.poids_kg || 1), 1);
      await client.query(
        'UPDATE dossiers_import_lignes SET cout_prorata_kg = $1 WHERE id_ligne = $2',
        [cout_kg, l.id_ligne],
      );
    }

    // 1 cession par ligne (idempotent via cle_unique)
    const cessions = [];
    for (const l of lignes) {
      const key = `CES-${dossier.numero_dossier}-L${l.id_ligne}`;
      const poids = Number(l.poids_kg || 0);
      const cout  = Number(l.cout_prorata_kg || 0) * poids * (1 + Number(marge_pct) / 100);
      const { rows } = await client.query(
        `INSERT INTO cessions_intragroupe
           (cle_unique, id_dossier_import, id_societe_cedante, id_societe_cessionnaire,
            poids_kg, cout_cession_dt, marge_pct, statut, date_calcul, cree_par)
         VALUES ($1,$2,1,2,$3,$4,$5,'calculee',NOW(),$6)
         ON CONFLICT (cle_unique) DO UPDATE SET
           poids_kg = EXCLUDED.poids_kg,
           cout_cession_dt = EXCLUDED.cout_cession_dt,
           marge_pct = EXCLUDED.marge_pct
         RETURNING *`,
        [key, id_dossier, poids, cout, marge_pct, user?.id_user || null],
      );
      cessions.push(rows[0]);
    }
    return { nb_lignes: lignes.length, nb_cessions: cessions.length, cessions };
  });
}
