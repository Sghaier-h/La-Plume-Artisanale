/**
 * Contrôleur Commandes — Module modulaire
 * CRUD commandes avec lignes d'articles
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// ── GET /api/commandes ──────────────────────────────────────────────────
export const getCommandes = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin, page, limit } = req.query;

    const qb = new QueryBuilder('commandes', 'c')
      .select([
        'c.id_commande', 'c.numero_commande', 'c.id_client',
        'cl.raison_sociale as client_nom',
        'c.date_commande', 'c.date_livraison_prevue',
        'c.statut', 'c.priorite', 'c.montant_total',
        'c.devise', 'c.date_creation'
      ])
      .join('LEFT JOIN clients cl ON c.id_client = cl.id_client')
      .search(['c.numero_commande', 'cl.raison_sociale'], search)
      .whereIf('c.statut = $?', statut)
      .whereIf('c.id_client = $?', client_id)
      .dateRange('c.date_commande', date_debut, date_fin)
      .orderBy('c.date_commande DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 20);

    const result = await qb.execute(pool);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getCommandes');
  }
};

// ── GET /api/commandes/:id ──────────────────────────────────────────────
export const getCommande = async (req, res) => {
  try {
    const { id } = req.params;

    const commande = await pool.query(
      `SELECT c.*, cl.raison_sociale as client_nom, cl.code_client as client_code
       FROM commandes c
       LEFT JOIN clients cl ON c.id_client = cl.id_client
       WHERE c.id_commande = $1`,
      [id]
    );

    if (commande.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Commande'));
    }

    const lignes = await pool.query(
      `SELECT ac.*, a.code_article, a.designation as article_designation
       FROM articles_commande ac
       LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
       WHERE ac.id_commande = $1
       ORDER BY ac.numero_ligne`,
      [id]
    );

    return sendSuccess(res, { ...commande.rows[0], lignes: lignes.rows });
  } catch (error) {
    return handleError(res, error, 'getCommande');
  }
};

// ── POST /api/commandes ─────────────────────────────────────────────────
export const createCommande = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { client_id, date_commande, date_livraison_prevue, lignes, ...commandeData } = req.body;

    if (!client_id || !date_commande || !lignes || lignes.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Client, date et lignes de commande requis');
    }

    // Vérifier client
    const clientCheck = await client.query(
      'SELECT id_client FROM clients WHERE id_client = $1 AND actif = true',
      [client_id]
    );
    if (clientCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Client actif'));
    }

    // Numéro auto
    const count = await client.query('SELECT COUNT(*) as count FROM commandes WHERE date_commande >= CURRENT_DATE');
    const numero = `CMD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    // Calcul montant
    let montantTotal = 0;
    for (const ligne of lignes) {
      montantTotal += (ligne.prix_unitaire || 0) * (ligne.quantite_commandee || 0) * (1 - (ligne.remise || 0) / 100);
    }

    const userId = getUserId(req) || 1;
    const commande = await client.query(
      `INSERT INTO commandes
        (numero_commande, id_client, date_commande, date_livraison_prevue,
         statut, priorite, montant_total, devise, conditions_paiement,
         adresse_livraison, observations, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        numero, client_id, date_commande, date_livraison_prevue || null,
        commandeData.statut || 'en_attente', commandeData.priorite || 'normale',
        montantTotal, commandeData.devise || 'TND', commandeData.conditions_paiement || null,
        commandeData.adresse_livraison || null, commandeData.observations || null, userId
      ]
    );

    const idCommande = commande.rows[0].id_commande;

    // Insérer lignes
    for (let i = 0; i < lignes.length; i++) {
      const l = lignes[i];
      const montantLigne = (l.prix_unitaire || 0) * (l.quantite_commandee || 0) * (1 - (l.remise || 0) / 100);

      await client.query(
        `INSERT INTO articles_commande
          (id_commande, numero_ligne, id_article, quantite_commandee,
           prix_unitaire, remise, montant_ligne, date_livraison_prevue, observations)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [idCommande, i + 1, l.id_article, l.quantite_commandee,
         l.prix_unitaire, l.remise || 0, montantLigne,
         l.date_livraison_prevue || null, l.observations || null]
      );
    }

    await client.query('COMMIT');
    logger.info('Commande créée', { id: idCommande, numero });

    const result = await pool.query(
      `SELECT c.*, cl.raison_sociale as client_nom
       FROM commandes c LEFT JOIN clients cl ON c.id_client = cl.id_client
       WHERE c.id_commande = $1`, [idCommande]
    );

    return sendSuccess(res, result.rows[0], 'Commande créée avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    await client.query('ROLLBACK');
    return handleError(res, error, 'createCommande');
  } finally {
    client.release();
  }
};

// ── PUT /api/commandes/:id ──────────────────────────────────────────────
export const updateCommande = async (req, res) => {
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    const { id } = req.params;
    const updateData = req.body;

    const existing = await dbClient.query(
      'SELECT id_commande, statut FROM commandes WHERE id_commande = $1', [id]
    );
    if (existing.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Commande'));
    }
    if (existing.rows[0].statut === 'validee' && updateData.statut !== 'validee') {
      await dbClient.query('ROLLBACK');
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Impossible de modifier une commande validée');
    }

    const userId = getUserId(req) || 1;
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && !['lignes', 'created_by', 'updated_by'].includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (userId !== null) {
      fields.push(`updated_by = $${paramCount}`);
      values.push(userId);
      paramCount++;
    }
    fields.push('date_modification = CURRENT_TIMESTAMP');

    if (fields.length > 0) {
      values.push(id);
      await dbClient.query(
        `UPDATE commandes SET ${fields.join(', ')} WHERE id_commande = $${paramCount}`,
        values
      );
    }

    // Mise à jour des lignes
    if (updateData.lignes) {
      await dbClient.query('DELETE FROM articles_commande WHERE id_commande = $1', [id]);

      for (let i = 0; i < updateData.lignes.length; i++) {
        const l = updateData.lignes[i];
        const montantLigne = (l.prix_unitaire || 0) * (l.quantite_commandee || 0) * (1 - (l.remise || 0) / 100);

        await dbClient.query(
          `INSERT INTO articles_commande
            (id_commande, numero_ligne, id_article, quantite_commandee,
             prix_unitaire, remise, montant_ligne, date_livraison_prevue, observations)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [id, i + 1, l.id_article, l.quantite_commandee,
           l.prix_unitaire, l.remise || 0, montantLigne,
           l.date_livraison_prevue || null, l.observations || null]
        );
      }

      // Recalculer le montant total
      const totalResult = await dbClient.query(
        'SELECT SUM(montant_ligne) as total FROM articles_commande WHERE id_commande = $1', [id]
      );
      await dbClient.query(
        'UPDATE commandes SET montant_total = $1, updated_by = $2, date_modification = CURRENT_TIMESTAMP WHERE id_commande = $3',
        [totalResult.rows[0].total || 0, userId, id]
      );
    }

    await dbClient.query('COMMIT');

    const result = await pool.query(
      `SELECT c.*, cl.raison_sociale as client_nom
       FROM commandes c LEFT JOIN clients cl ON c.id_client = cl.id_client
       WHERE c.id_commande = $1`, [id]
    );

    return sendSuccess(res, result.rows[0], 'Commande mise à jour');
  } catch (error) {
    await dbClient.query('ROLLBACK');
    return handleError(res, error, 'updateCommande');
  } finally {
    dbClient.release();
  }
};

// ── DELETE /api/commandes/:id ───────────────────────────────────────────
export const deleteCommande = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT statut FROM commandes WHERE id_commande = $1', [id]);
    if (existing.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Commande'));
    }
    if (existing.rows[0].statut === 'validee') {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Impossible de supprimer une commande validée');
    }

    await pool.query('DELETE FROM articles_commande WHERE id_commande = $1', [id]);
    await pool.query('DELETE FROM commandes WHERE id_commande = $1', [id]);
    logger.info('Commande supprimée', { id });

    return sendSuccess(res, null, 'Commande supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteCommande');
  }
};
