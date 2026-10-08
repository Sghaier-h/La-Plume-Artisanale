/**
 * Contrôleur Factures — Module modulaire
 * Gestion complète des factures : CRUD, génération depuis commande/BL
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { validateWorkflowStatusForTable } from '../../../src/utils/validations.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// ── GET /api/factures ───────────────────────────────────────────────────
export const getFactures = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin, page, limit } = req.query;

    const qb = new QueryBuilder('factures', 'f')
      .select([
        'f.id_facture', 'f.numero_facture', 'f.id_commande', 'f.id_bl',
        'f.id_client', 'c.raison_sociale as client_nom',
        'cmd.numero_commande', 'bl.numero_bl',
        'f.date_facture', 'f.date_echeance', 'f.statut',
        'f.montant_ht', 'f.montant_tva', 'f.montant_ttc',
        'f.montant_regle', 'f.montant_restant', 'f.created_at'
      ])
      .join('LEFT JOIN comptes c ON f.id_client = c.id_client')
      .join('LEFT JOIN commandes cmd ON f.id_commande = cmd.id_commande')
      .join('LEFT JOIN bons_livraison bl ON f.id_bl = bl.id_bl')
      .search(['f.numero_facture', 'c.raison_sociale'], search)
      .whereIf('f.statut = $?', statut)
      .whereIf('f.id_client = $?', client_id)
      .dateRange('f.date_facture', date_debut, date_fin)
      .orderBy('f.date_facture DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 20);

    const result = await qb.execute(pool);

    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getFactures');
  }
};

// ── GET /api/factures/:id ───────────────────────────────────────────────
export const getFactureById = async (req, res) => {
  try {
    const { id } = req.params;

    const facture = await pool.query(
      `SELECT f.*, c.raison_sociale as client_nom, c.code_client as client_code,
              cmd.numero_commande, bl.numero_bl
       FROM factures f
       LEFT JOIN comptes c ON f.id_client = c.id_client
       LEFT JOIN commandes cmd ON f.id_commande = cmd.id_commande
       LEFT JOIN bons_livraison bl ON f.id_bl = bl.id_bl
       WHERE f.id_facture = $1`,
      [id]
    );

    if (facture.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Facture'));
    }

    const lignes = await pool.query(
      `SELECT lf.*, a.code_article as article_reference
       FROM lignes_facture lf
       LEFT JOIN articles_catalogue a ON lf.id_article = a.id_article
       WHERE lf.id_facture = $1
       ORDER BY lf.ordre, lf.id_ligne`,
      [id]
    );

    return sendSuccess(res, { ...facture.rows[0], lignes: lignes.rows });
  } catch (error) {
    return handleError(res, error, 'getFactureById');
  }
};

// ── POST /api/factures ──────────────────────────────────────────────────
export const createFacture = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id_commande, id_bl, id_client, date_facture, lignes, ...factureData } = req.body;

    if (!id_client || !date_facture || !lignes || lignes.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Client, date et lignes de facture requis', HTTP_STATUS.BAD_REQUEST);
    }

    // Vérifier client
    const clientCheck = await client.query(
      'SELECT id_client FROM comptes WHERE id_client = $1 AND actif = true',
      [id_client]
    );
    if (clientCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Client actif'));
    }

    // Générer numéro
    const numeroResult = await client.query('SELECT generer_numero_facture() as numero');
    const numero = numeroResult.rows[0].numero;

    // Calcul des totaux
    let montantHt = 0;
    let montantTva = 0;
    const tauxTva = factureData.taux_tva || 20;
    const remiseGlobale = factureData.remise_globale || 0;

    for (const ligne of lignes) {
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite || 0);
      const remise = parseFloat(ligne.remise || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);

      const montantLigneHt = prix * qte * (1 - remise / 100);
      montantHt += montantLigneHt;
      montantTva += montantLigneHt * tauxTvaLigne / 100;
    }

    const montantRemise = montantHt * remiseGlobale / 100;
    montantHt -= montantRemise;
    const montantTtc = montantHt + montantTva;

    const dateEcheance = factureData.date_echeance || new Date(
      new Date(date_facture).getTime() + 30 * 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0];

    // Insérer la facture
    const factureResult = await client.query(
      `INSERT INTO factures (
        numero_facture, id_commande, id_bl, id_client, date_facture, date_echeance, statut,
        montant_ht, taux_tva, montant_tva, montant_ttc, montant_regle, montant_restant,
        remise_globale, montant_remise, reference_client, conditions_paiement, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        numero, id_commande || null, id_bl || null, id_client, date_facture, dateEcheance,
        factureData.statut || 'BROUILLON', montantHt, tauxTva, montantTva, montantTtc,
        0, montantTtc, remiseGlobale, montantRemise,
        factureData.reference_client || null, factureData.conditions_paiement || null,
        factureData.notes || null
      ]
    );

    const idFacture = factureResult.rows[0].id_facture;

    // Insérer les lignes
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite || 0);
      const remise = parseFloat(ligne.remise || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);
      const mHt = prix * qte * (1 - remise / 100);
      const mTva = mHt * tauxTvaLigne / 100;

      await client.query(
        `INSERT INTO lignes_facture (
          id_facture, id_ligne_commande, id_ligne_bl, id_article, designation, quantite,
          prix_unitaire_ht, taux_tva, remise, montant_ht, montant_tva, montant_ttc, ordre
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          idFacture, ligne.id_ligne_commande || null, ligne.id_ligne_bl || null,
          ligne.id_article || null, ligne.designation || '', qte, prix, tauxTvaLigne, remise,
          mHt, mTva, mHt + mTva, i + 1
        ]
      );
    }

    await client.query('COMMIT');
    logger.info('Facture créée', { id: idFacture, numero });

    // Récupérer la facture complète
    const factureComplet = await pool.query(
      `SELECT f.*, c.raison_sociale as client_nom, cmd.numero_commande, bl.numero_bl
       FROM factures f
       LEFT JOIN comptes c ON f.id_client = c.id_client
       LEFT JOIN commandes cmd ON f.id_commande = cmd.id_commande
       LEFT JOIN bons_livraison bl ON f.id_bl = bl.id_bl
       WHERE f.id_facture = $1`,
      [idFacture]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_facture WHERE id_facture = $1 ORDER BY ordre',
      [idFacture]
    );

    return sendSuccess(res, { ...factureComplet.rows[0], lignes: lignesResult.rows }, null, HTTP_STATUS.CREATED);
  } catch (error) {
    await client.query('ROLLBACK');
    return handleError(res, error, 'createFacture');
  } finally {
    client.release();
  }
};

// ── POST /api/factures/from-commande/:id ────────────────────────────────
export const createFactureFromCommande = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { date_facture, date_echeance, ...factureData } = req.body;

    const commande = await client.query('SELECT * FROM commandes WHERE id_commande = $1', [id]);
    if (commande.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Commande'));
    }

    const cmd = commande.rows[0];

    const lignesCommande = await client.query(
      `SELECT ac.*, a.code_article as article_reference, a.designation as article_designation
       FROM articles_commande ac
       LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
       WHERE ac.id_commande = $1 ORDER BY ac.numero_ligne`,
      [id]
    );

    if (lignesCommande.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.BAD_REQUEST, "La commande n'a pas de lignes");
    }

    const lignesFacture = lignesCommande.rows.map(ligne => ({
      id_ligne_commande: ligne.id_article_commande,
      id_article: ligne.id_article,
      designation: ligne.article_designation || '',
      quantite: ligne.quantite_commandee,
      prix_unitaire_ht: ligne.prix_unitaire,
      taux_tva: 20,
      remise: ligne.remise || 0
    }));

    await client.query('COMMIT');

    req.body = {
      id_commande: id,
      id_client: cmd.id_client,
      date_facture: date_facture || new Date().toISOString().split('T')[0],
      date_echeance: date_echeance || null,
      lignes: lignesFacture,
      conditions_paiement: cmd.conditions_paiement || null,
      ...factureData
    };
    return createFacture(req, res);
  } catch (error) {
    await client.query('ROLLBACK');
    return handleError(res, error, 'createFactureFromCommande');
  } finally {
    client.release();
  }
};

// ── POST /api/factures/from-bl/:id ──────────────────────────────────────
export const createFactureFromBL = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { date_facture, date_echeance, ...factureData } = req.body;

    const bl = await client.query('SELECT * FROM bons_livraison WHERE id_bl = $1', [id]);
    if (bl.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Bon de livraison'));
    }

    const blData = bl.rows[0];

    const lignesBl = await client.query(
      `SELECT lb.*, a.code_article as article_reference, a.designation as article_designation
       FROM lignes_bl lb
       LEFT JOIN articles_catalogue a ON lb.id_article = a.id_article
       WHERE lb.id_bl = $1 ORDER BY lb.ordre`,
      [id]
    );

    if (lignesBl.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.BAD_REQUEST, "Le bon de livraison n'a pas de lignes");
    }

    const lignesFacture = lignesBl.rows.map(ligne => ({
      id_ligne_bl: ligne.id_ligne,
      id_article: ligne.id_article,
      designation: ligne.designation || '',
      quantite: ligne.quantite_livree,
      prix_unitaire_ht: ligne.prix_unitaire_ht,
      taux_tva: ligne.taux_tva || 20,
      remise: 0
    }));

    await client.query('COMMIT');

    req.body = {
      id_bl: id,
      id_commande: blData.id_commande || null,
      id_client: blData.id_client,
      date_facture: date_facture || new Date().toISOString().split('T')[0],
      date_echeance: date_echeance || null,
      lignes: lignesFacture,
      ...factureData
    };
    return createFacture(req, res);
  } catch (error) {
    await client.query('ROLLBACK');
    return handleError(res, error, 'createFactureFromBL');
  } finally {
    client.release();
  }
};

// ── PUT /api/factures/:id ───────────────────────────────────────────────
export const updateFacture = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { lignes, ...factureData } = req.body;

    const factureCheck = await client.query(
      'SELECT id_facture, statut FROM factures WHERE id_facture = $1',
      [id]
    );
    if (factureCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Facture'));
    }

    const statusValidation = validateWorkflowStatusForTable('factures', factureCheck.rows[0].statut);
    if (!statusValidation.valid) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.BAD_REQUEST, statusValidation.error);
    }

    // Mise à jour dynamique
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(factureData).forEach(key => {
      if (key !== 'id_facture' && key !== 'numero_facture') {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(factureData[key]);
        paramCount++;
      }
    });

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length > 1) {
      await client.query(
        `UPDATE factures SET ${updateFields.join(', ')} WHERE id_facture = $${paramCount}`,
        updateValues
      );
    }

    await client.query('COMMIT');

    const factureComplet = await pool.query(
      `SELECT f.*, c.raison_sociale as client_nom, cmd.numero_commande, bl.numero_bl
       FROM factures f
       LEFT JOIN comptes c ON f.id_client = c.id_client
       LEFT JOIN commandes cmd ON f.id_commande = cmd.id_commande
       LEFT JOIN bons_livraison bl ON f.id_bl = bl.id_bl
       WHERE f.id_facture = $1`,
      [id]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_facture WHERE id_facture = $1 ORDER BY ordre',
      [id]
    );

    return sendSuccess(res, { ...factureComplet.rows[0], lignes: lignesResult.rows });
  } catch (error) {
    await client.query('ROLLBACK');
    return handleError(res, error, 'updateFacture');
  } finally {
    client.release();
  }
};

// ── DELETE /api/factures/:id ────────────────────────────────────────────
export const deleteFacture = async (req, res) => {
  try {
    const { id } = req.params;

    const facture = await pool.query(
      'SELECT id_facture, statut FROM factures WHERE id_facture = $1',
      [id]
    );
    if (facture.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Facture'));
    }

    if (facture.rows[0].statut === 'REGLEE') {
      return sendError(res, 'Impossible de supprimer une facture déjà réglée', HTTP_STATUS.BAD_REQUEST);
    }

    await pool.query('DELETE FROM factures WHERE id_facture = $1', [id]);
    logger.info('Facture supprimée', { id });

    return sendSuccess(res, { message: 'Facture supprimée avec succès' });
  } catch (error) {
    return handleError(res, error, 'deleteFacture');
  }
};
