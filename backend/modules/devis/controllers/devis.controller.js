/**
 * Contrôleur Devis — Module modulaire
 * CRUD + transformation devis → commande
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { validateDates, validateWorkflowStatusForTable, validateReferentialIntegrity } from '../../../src/utils/validations.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// ── GET /api/devis ──────────────────────────────────────────────────────
export const getDevis = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin, page, limit } = req.query;

    const qb = new QueryBuilder('devis', 'd')
      .select([
        'd.id_devis', 'd.numero_devis', 'd.id_client',
        'c.raison_sociale as client_nom',
        'd.date_devis', 'd.date_validite', 'd.statut',
        'd.montant_ht', 'd.montant_tva', 'd.montant_ttc',
        'd.id_commande', 'd.created_at'
      ])
      .join('LEFT JOIN clients c ON d.id_client = c.id_client')
      .search(['d.numero_devis', 'c.raison_sociale'], search)
      .whereIf('d.statut = $?', statut)
      .whereIf('d.id_client = $?', client_id)
      .dateRange('d.date_devis', date_debut, date_fin)
      .orderBy('d.date_devis DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 20);

    const result = await qb.execute(pool);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getDevis');
  }
};

// ── GET /api/devis/:id ──────────────────────────────────────────────────
export const getDevisById = async (req, res) => {
  try {
    const { id } = req.params;

    const devis = await pool.query(
      `SELECT d.*, c.raison_sociale as client_nom, c.code_client as client_code,
              cmd.numero_commande
       FROM devis d
       LEFT JOIN clients c ON d.id_client = c.id_client
       LEFT JOIN commandes cmd ON d.id_commande = cmd.id_commande
       WHERE d.id_devis = $1`,
      [id]
    );

    if (devis.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Devis'));
    }

    const lignes = await pool.query(
      `SELECT ld.*, a.code_article as article_reference
       FROM lignes_devis ld
       LEFT JOIN articles_catalogue a ON ld.id_article = a.id_article
       WHERE ld.id_devis = $1 ORDER BY ld.ordre, ld.id_ligne`,
      [id]
    );

    return sendSuccess(res, { ...devis.rows[0], lignes: lignes.rows });
  } catch (error) {
    return handleError(res, error, 'getDevisById');
  }
};

// ── POST /api/devis ─────────────────────────────────────────────────────
export const createDevis = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id_client, date_devis, date_validite, lignes, ...devisData } = req.body;

    if (!id_client || !date_devis || !lignes || lignes.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD('client, date et lignes'));
    }

    if (date_devis && date_validite) {
      const dateValidation = validateDates(date_devis, date_validite);
      if (!dateValidation.valid) {
        await client.query('ROLLBACK');
        return sendError(res, HTTP_STATUS.BAD_REQUEST, dateValidation.error);
      }
    }

    const clientCheck = await validateReferentialIntegrity('clients', 'id_client', id_client, true);
    if (!clientCheck.valid) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, clientCheck.error);
    }

    const numeroResult = await client.query('SELECT generer_numero_devis() as numero');
    const numero = numeroResult.rows[0].numero;

    // Calcul des totaux
    let montantHt = 0, montantTva = 0;
    const tauxTva = devisData.taux_tva || 20;
    const remiseGlobale = devisData.remise_globale || 0;

    for (const ligne of lignes) {
      const mHt = parseFloat(ligne.prix_unitaire_ht || 0) * parseFloat(ligne.quantite || 0) * (1 - parseFloat(ligne.remise || 0) / 100);
      montantHt += mHt;
      montantTva += mHt * parseFloat(ligne.taux_tva || tauxTva) / 100;
    }

    const montantRemise = montantHt * remiseGlobale / 100;
    montantHt -= montantRemise;
    const montantTtc = montantHt + montantTva;

    const userId = getUserId(req);
    const devisResult = await client.query(
      `INSERT INTO devis (
        numero_devis, id_client, date_devis, date_validite, statut,
        montant_ht, taux_tva, montant_tva, montant_ttc, remise_globale, montant_remise,
        reference_client, conditions_paiement, conditions_livraison, notes, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        numero, id_client, date_devis, date_validite || null, devisData.statut || 'BROUILLON',
        montantHt, tauxTva, montantTva, montantTtc, remiseGlobale, montantRemise,
        devisData.reference_client || null, devisData.conditions_paiement || null,
        devisData.conditions_livraison || null, devisData.notes || null, userId
      ]
    );

    const idDevis = devisResult.rows[0].id_devis;

    for (let i = 0; i < lignes.length; i++) {
      const l = lignes[i];
      const prix = parseFloat(l.prix_unitaire_ht || 0);
      const qte = parseFloat(l.quantite || 0);
      const rem = parseFloat(l.remise || 0);
      const tvl = parseFloat(l.taux_tva || tauxTva);
      const mHt = prix * qte * (1 - rem / 100);
      const mTva = mHt * tvl / 100;

      await client.query(
        `INSERT INTO lignes_devis (id_devis, id_article, designation, quantite,
          prix_unitaire_ht, taux_tva, remise, montant_ht, montant_tva, montant_ttc, ordre)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [idDevis, l.id_article || null, l.designation || '', qte, prix, tvl, rem, mHt, mTva, mHt + mTva, i + 1]
      );
    }

    await client.query('COMMIT');
    logger.info('Devis créé', { id: idDevis, numero });

    const devisComplet = await pool.query(
      `SELECT d.*, c.raison_sociale as client_nom FROM devis d
       LEFT JOIN clients c ON d.id_client = c.id_client WHERE d.id_devis = $1`, [idDevis]
    );
    const lignesResult = await pool.query('SELECT * FROM lignes_devis WHERE id_devis = $1 ORDER BY ordre', [idDevis]);

    return sendSuccess(res, { ...devisComplet.rows[0], lignes: lignesResult.rows }, null, HTTP_STATUS.CREATED);
  } catch (error) {
    await client.query('ROLLBACK');
    return handleError(res, error, 'createDevis');
  } finally {
    client.release();
  }
};

// ── PUT /api/devis/:id ──────────────────────────────────────────────────
export const updateDevis = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { lignes, ...devisData } = req.body;

    const devisCheck = await client.query('SELECT id_devis, statut FROM devis WHERE id_devis = $1', [id]);
    if (devisCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Devis'));
    }

    if (devisCheck.rows[0].statut === 'TRANSFORME') {
      await client.query('ROLLBACK');
      return sendError(res, 'Impossible de modifier un devis transformé en commande', HTTP_STATUS.BAD_REQUEST);
    }

    // Recalcul si lignes fournies
    if (lignes && lignes.length > 0) {
      let montantHt = 0, montantTva = 0;
      const tauxTva = devisData.taux_tva || 20;
      const remiseGlobale = devisData.remise_globale || 0;

      for (const l of lignes) {
        const mHt = parseFloat(l.prix_unitaire_ht || 0) * parseFloat(l.quantite || 0) * (1 - parseFloat(l.remise || 0) / 100);
        montantHt += mHt;
        montantTva += mHt * parseFloat(l.taux_tva || tauxTva) / 100;
      }

      const montantRemise = montantHt * remiseGlobale / 100;
      montantHt -= montantRemise;
      devisData.montant_ht = montantHt;
      devisData.montant_tva = montantTva;
      devisData.montant_ttc = montantHt + montantTva;
      devisData.montant_remise = montantRemise;

      await client.query('DELETE FROM lignes_devis WHERE id_devis = $1', [id]);

      for (let i = 0; i < lignes.length; i++) {
        const l = lignes[i];
        const prix = parseFloat(l.prix_unitaire_ht || 0);
        const qte = parseFloat(l.quantite || 0);
        const rem = parseFloat(l.remise || 0);
        const tvl = parseFloat(l.taux_tva || devisData.taux_tva || 20);
        const mHt = prix * qte * (1 - rem / 100);
        const mTva = mHt * tvl / 100;

        await client.query(
          `INSERT INTO lignes_devis (id_devis, id_article, designation, quantite,
            prix_unitaire_ht, taux_tva, remise, montant_ht, montant_tva, montant_ttc, ordre)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [id, l.id_article || null, l.designation || '', qte, prix, tvl, rem, mHt, mTva, mHt + mTva, i + 1]
        );
      }
    }

    // Mise à jour dynamique
    const userId = getUserId(req);
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(devisData).forEach(key => {
      if (!['id_devis', 'numero_devis', 'created_by', 'updated_by'].includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(devisData[key]);
        paramCount++;
      }
    });

    if (userId !== null) {
      updateFields.push(`updated_by = $${paramCount}`);
      updateValues.push(userId);
      paramCount++;
    }
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length > 1) {
      await client.query(`UPDATE devis SET ${updateFields.join(', ')} WHERE id_devis = $${paramCount}`, updateValues);
    }

    await client.query('COMMIT');

    const devisComplet = await pool.query(
      `SELECT d.*, c.raison_sociale as client_nom FROM devis d
       LEFT JOIN clients c ON d.id_client = c.id_client WHERE d.id_devis = $1`, [id]
    );
    const lignesResult = await pool.query('SELECT * FROM lignes_devis WHERE id_devis = $1 ORDER BY ordre', [id]);

    return sendSuccess(res, { ...devisComplet.rows[0], lignes: lignesResult.rows });
  } catch (error) {
    await client.query('ROLLBACK');
    return handleError(res, error, 'updateDevis');
  } finally {
    client.release();
  }
};

// ── POST /api/devis/:id/transformer ─────────────────────────────────────
export const transformerEnCommande = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { date_commande, date_livraison_prevue, ...commandeData } = req.body;

    const devisResult = await client.query('SELECT * FROM devis WHERE id_devis = $1', [id]);
    if (devisResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Devis'));
    }

    const devis = devisResult.rows[0];
    if (devis.statut === 'TRANSFORME') {
      await client.query('ROLLBACK');
      return sendError(res, 'Ce devis a déjà été transformé en commande', HTTP_STATUS.BAD_REQUEST);
    }

    // Générer numéro commande
    const count = await client.query("SELECT COUNT(*) as count FROM commandes WHERE date_commande >= CURRENT_DATE");
    const numeroCommande = `CMD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    const lignesDevis = await client.query('SELECT * FROM lignes_devis WHERE id_devis = $1 ORDER BY ordre', [id]);

    const commandeResult = await client.query(
      `INSERT INTO commandes (
        numero_commande, id_client, date_commande, date_livraison_prevue,
        statut, priorite, montant_total, devise, conditions_paiement, adresse_livraison, observations
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        numeroCommande, devis.id_client, date_commande || new Date().toISOString().split('T')[0],
        date_livraison_prevue || null, 'en_attente', commandeData.priorite || 'normale',
        devis.montant_ttc, 'TND', devis.conditions_paiement || null,
        commandeData.adresse_livraison || null, devis.notes || null
      ]
    );

    const idCommande = commandeResult.rows[0].id_commande;

    for (let i = 0; i < lignesDevis.rows.length; i++) {
      const ld = lignesDevis.rows[i];
      await client.query(
        `INSERT INTO articles_commande (id_commande, numero_ligne, id_article, quantite_commandee,
          prix_unitaire, remise, montant_ligne, statut)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [idCommande, i + 1, ld.id_article || null, ld.quantite, ld.prix_unitaire_ht, ld.remise, ld.montant_ttc, 'en_attente']
      );
    }

    await client.query(
      `UPDATE devis SET statut = 'TRANSFORME', id_commande = $1, date_transformation = CURRENT_TIMESTAMP WHERE id_devis = $2`,
      [idCommande, id]
    );

    await client.query('COMMIT');
    logger.info('Devis transformé en commande', { devisId: id, commandeId: idCommande, numero: numeroCommande });

    return sendSuccess(res, {
      devis: { ...devis, statut: 'TRANSFORME', id_commande: idCommande },
      commande: commandeResult.rows[0],
      message: 'Devis transformé en commande avec succès'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return handleError(res, error, 'transformerEnCommande');
  } finally {
    client.release();
  }
};

// ── DELETE /api/devis/:id ───────────────────────────────────────────────
export const deleteDevis = async (req, res) => {
  try {
    const { id } = req.params;

    const devis = await pool.query('SELECT id_devis, statut FROM devis WHERE id_devis = $1', [id]);
    if (devis.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Devis'));
    }

    if (devis.rows[0].statut === 'TRANSFORME') {
      return sendError(res, 'Impossible de supprimer un devis transformé en commande', HTTP_STATUS.BAD_REQUEST);
    }

    await pool.query('DELETE FROM devis WHERE id_devis = $1', [id]);
    logger.info('Devis supprimé', { id });

    return sendSuccess(res, { message: 'Devis supprimé avec succès' });
  } catch (error) {
    return handleError(res, error, 'deleteDevis');
  }
};
