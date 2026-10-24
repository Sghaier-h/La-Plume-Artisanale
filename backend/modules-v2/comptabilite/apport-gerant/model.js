// model.js — comptabilite/apport-gerant (§14quater.6)
// DAL : comptes_courants_associes + apports_gerant_mouvements + mouvements_caisse.
// L'apport gérant est une opération atomique : (1) insert mouvement CCA,
// (2) insert mouvement_caisse type_mouvement='apport_gerant', (3) MAJ solde.
import { getPool, withTransaction } from '../../_shared/db.js';
const pool = getPool();

/** Retourne (ou crée) le CCA du gérant pour la société donnée. */
export async function getOrCreateCCA(client, { id_user_gerant, id_societe = null, libelle = null }) {
  const q = `
    SELECT * FROM comptes_courants_associes
     WHERE id_user_gerant = $1 AND COALESCE(id_societe, 0) = COALESCE($2, 0)
     LIMIT 1
  `;
  const r = await client.query(q, [id_user_gerant, id_societe]);
  if (r.rows.length) return r.rows[0];
  const ins = await client.query(
    `INSERT INTO comptes_courants_associes (id_user_gerant, id_societe, libelle)
     VALUES ($1, $2, $3) RETURNING *`,
    [id_user_gerant, id_societe, libelle || `CCA gérant #${id_user_gerant}`],
  );
  return ins.rows[0];
}

/** Lecture directe du solde + CCA avec enveloppe. */
export async function getSoldeCCA({ id_user_gerant, id_societe = null }) {
  const r = await pool.query(
    `SELECT v.* FROM v_cca_soldes v
      WHERE v.id_user_gerant = $1
        AND COALESCE(v.id_societe, 0) = COALESCE($2, 0)
      LIMIT 1`,
    [id_user_gerant, id_societe],
  );
  return r.rows[0] || null;
}

/** Historique paginé des mouvements d'apport/retrait pour un CCA. */
export async function listHistorique({ id_user_gerant, id_societe = null, limit = 100, offset = 0 }) {
  const where = ['c.id_user_gerant = $1', 'COALESCE(c.id_societe, 0) = COALESCE($2, 0)'];
  const values = [id_user_gerant, id_societe];
  const sql = `
    SELECT m.*, c.libelle AS cca_libelle,
           ca.code AS caisse_code, ca.libelle AS caisse_libelle
      FROM apports_gerant_mouvements m
      JOIN comptes_courants_associes c ON c.id_cca = m.id_cca
      LEFT JOIN caisses ca ON ca.id_caisse = m.id_caisse_destination
     WHERE ${where.join(' AND ')}
     ORDER BY m.date_mouvement DESC, m.id_mvt_apport DESC
     LIMIT $3 OFFSET $4
  `;
  values.push(limit, offset);
  const r = await pool.query(sql, values);
  return r.rows;
}

/**
 * Saisit un apport (ou retrait) :
 *  - crée/récupère le CCA
 *  - insert dans apports_gerant_mouvements
 *  - insert dans mouvements_caisse (type_mouvement='apport_gerant',
 *    sens=entree si apport / sortie si retrait)
 *  - met à jour le solde stocké du CCA
 */
export async function saisirApport({
  id_user_gerant,
  id_societe = null,
  montant,
  type_mvt,                        // 'apport' | 'retrait'
  mode_paiement = 'espece',
  id_caisse_destination,
  id_document_archive = null,
  reference = null,
  libelle = null,
  notes = null,
  saisi_par,
}) {
  if (!(Number(montant) > 0)) throw new Error('Montant doit être strictement positif');
  if (!['apport', 'retrait'].includes(type_mvt)) throw new Error("type_mvt doit être 'apport' ou 'retrait'");
  if (!id_caisse_destination) throw new Error('id_caisse_destination requis');

  return withTransaction(async (client) => {
    const cca = await getOrCreateCCA(client, { id_user_gerant, id_societe });

    // Mouvement caisse : apport = entrée, retrait = sortie
    const sens = type_mvt === 'apport' ? 'entree' : 'sortie';
    const typeMvtCaisse = 'apport_gerant';

    const mvtCaisseIns = await client.query(
      `INSERT INTO mouvements_caisse
         (id_caisse, date_mouvement, sens, type_mouvement, type_mvt, montant,
          libelle, reference, mode_paiement, piece_type, id_piece_liee,
          cree_par, id_utilisateur, source_type)
       VALUES ($1, NOW(), $2, $3, $2, $4, $5, $6, $7, $8, $9, $10, $10, 'apport_gerant')
       RETURNING id_mouvement`,
      [
        id_caisse_destination,
        sens,
        typeMvtCaisse,
        Number(montant),
        libelle || `${type_mvt === 'apport' ? 'Apport' : 'Retrait'} gérant`,
        reference,
        mode_paiement,
        'apport_gerant',
        null,
        saisi_par || null,
      ],
    );
    const id_mouvement_caisse = mvtCaisseIns.rows[0].id_mouvement;

    const apgIns = await client.query(
      `INSERT INTO apports_gerant_mouvements
         (id_cca, montant, type_mvt, mode_paiement, id_caisse_destination,
          id_mouvement_caisse, id_document_archive, reference, libelle,
          notes, saisi_par)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        cca.id_cca,
        Number(montant),
        type_mvt,
        mode_paiement,
        id_caisse_destination,
        id_mouvement_caisse,
        id_document_archive,
        reference,
        libelle,
        notes,
        saisi_par || null,
      ],
    );

    // Mise à jour solde stocké
    const delta = type_mvt === 'apport' ? Number(montant) : -Number(montant);
    const soldeUp = await client.query(
      `UPDATE comptes_courants_associes
          SET solde = solde + $1, updated_at = NOW()
        WHERE id_cca = $2
      RETURNING *`,
      [delta, cca.id_cca],
    );

    return {
      mouvement_apport: apgIns.rows[0],
      mouvement_caisse: { id_mouvement: id_mouvement_caisse },
      cca: soldeUp.rows[0],
    };
  });
}
