/**
 * Contrôleur Alimentation Stock — Analyse et création OF automatiques
 *
 * Porté depuis 04_Catalogue.gs :
 * - getAnalyseStockBasAlimentation
 * - Création OF depuis déficit stock
 */

import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS } from '../../../src/utils/error.helper.js';
import { logger } from '../../../src/utils/logger.js';
import {
  analyseAlimentationStock,
  creerOfAlimentation,
  creerOfsAlimentationLot
} from '../../../src/services/alimentation-stock.service.js';

// ─────────────────────────────────────────────────────────────────────
// GET /api/of/alimentation/analyse
// Analyse complète des articles à alimenter
// ─────────────────────────────────────────────────────────────────────
export const getAnalyseAlimentation = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await analyseAlimentationStock({ limit });
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getAnalyseAlimentation');
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/of/alimentation/article/:id
// Crée un OF d'alimentation pour un article
// Body: { quantite, priorite? }
// ─────────────────────────────────────────────────────────────────────
export const creerOfArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantite, priorite } = req.body;
    const userId = getUserId(req) || 1;

    if (!quantite || quantite <= 0) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Quantité > 0 requise');
    }

    const of = await creerOfAlimentation({
      idArticle: parseInt(id),
      quantite: parseFloat(quantite),
      userId,
      priorite: priorite || 'normale'
    });

    return sendSuccess(res, of, 'OF d\'alimentation créé', HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'creerOfArticle');
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/of/alimentation/lot
// Crée en lot tous les OF recommandés par l'analyse
// Body: { articles: [...], priorite? }
// ─────────────────────────────────────────────────────────────────────
export const creerOfLot = async (req, res) => {
  try {
    const { articles, priorite } = req.body;
    const userId = getUserId(req) || 1;

    if (!Array.isArray(articles) || articles.length === 0) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Liste d\'articles requise');
    }

    const result = await creerOfsAlimentationLot({
      articles,
      userId,
      priorite: priorite || 'normale'
    });

    logger.info('OFs alimentation créés en lot', {
      crees: result.crees.length,
      erreurs: result.erreurs.length
    });

    return sendSuccess(res, result, `${result.crees.length} OFs créés, ${result.erreurs.length} erreurs`);
  } catch (error) {
    return handleError(res, error, 'creerOfLot');
  }
};
