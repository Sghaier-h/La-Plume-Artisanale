/**
 * POS Vente Controller
 * Contrôleur pour les ventes POS
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/pos/ventes
export const getSales = async (req, res) => {
  try {
    const query = `SELECT * FROM ventes_caisse ORDER BY COALESCE(created_at, NOW()) DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Ventes récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getSales');
  }
};

// GET /api/pos/ventes/:id
export const getSale = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM ventes_caisse WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Vente non trouvée', 404);
    }
    
    // Charger les lignes
    const linesQuery = `SELECT * FROM lignes_vente_caisse WHERE id_vente = $1`;
    const linesResult = await pool.query(linesQuery, [result.rows[0].id]);
    result.rows[0].lignes = linesResult.rows;
    
    return sendSuccess(res, result.rows[0], 'Vente récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getSale');
  }
};

// POST /api/pos/ventes
export const createSale = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const { id_session, lignes, paiements } = req.body;
    
    // Calculer le total
    let montant_total = 0;
    for (const ligne of lignes) {
      montant_total += (ligne.prix_unitaire_ht || 0) * (ligne.quantite || 0);
    }
    
    // Créer la vente
    const saleQuery = `
      INSERT INTO ventes_caisse (id_session, montant_total, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const saleResult = await pool.query(saleQuery, [id_session, montant_total, userId]);
    const sale = saleResult.rows[0];
    
    // Créer les lignes
    for (const ligne of lignes) {
      await pool.query(`
        INSERT INTO lignes_vente_caisse (
          id_vente, id_article, quantite, prix_unitaire_ht
        )
        VALUES ($1, $2, $3, $4)
      `, [
        sale.id,
        ligne.id_article || ligne.id_product,
        ligne.quantite || ligne.quantity || 1,
        ligne.prix_unitaire_ht || ligne.price_unit || 0
      ]);
    }
    
    // Créer les paiements (si la table existe)
    if (paiements && paiements.length > 0) {
      try {
        for (const paiement of paiements) {
          await pool.query(`
            INSERT INTO pos_paiements (
              id_vente, type, amount, date_paiement
            )
            VALUES ($1, $2, $3, NOW())
          `, [sale.id, paiement.type, paiement.amount]);
        }
      } catch (error) {
        // Table pos_paiements peut ne pas exister, ignorer
        logger.warn('Table pos_paiements non trouvée, paiements ignorés');
      }
    }
    
    // Mettre à jour le stock
    for (const ligne of lignes) {
      await pool.query(`
        UPDATE articles
        SET qty_available = qty_available - $1
        WHERE id_article = $2
      `, [ligne.quantite, ligne.id_article]);
    }
    
    return sendSuccess(res, sale, 'Vente créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createSale');
  }
};
