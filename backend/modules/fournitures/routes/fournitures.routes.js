/**
 * Alias /api/fournitures -> articles_catalogue filtré par type 'fourniture'.
 *
 * Résout dynamiquement l'id du type_article dont le libellé contient
 * "fourniture" (case-insensitive), puis injecte le filtre dans la query
 * avant de déléguer aux handlers articles-catalogue.
 */
import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import {
  getArticlesCatalogue,
  getArticleCatalogueById,
  createArticleCatalogue,
  updateArticleCatalogue,
  deleteArticleCatalogue
} from '../../articles-catalogue/controllers/articles-catalogue.controller.js';

const router = express.Router();

// Cache de l'id_type_article "fourniture"
let _fournitureTypeId = null;
const getFournitureTypeId = async () => {
  if (_fournitureTypeId !== null) return _fournitureTypeId;
  try {
    const r = await pool.query(
      `SELECT id_type_article FROM types_articles
        WHERE LOWER(libelle) LIKE 'fourniture%' OR LOWER(code) = 'fourniture'
        LIMIT 1`
    );
    _fournitureTypeId = r.rows[0]?.id_type_article ?? 0;
  } catch {
    _fournitureTypeId = 0;
  }
  return _fournitureTypeId;
};

const injectTypeFilter = async (req, _res, next) => {
  try {
    const typeId = await getFournitureTypeId();
    req.query = { ...req.query, id_type_article: typeId };
    if (req.method !== 'GET' && req.body && typeof req.body === 'object' && !req.body.id_type_article) {
      req.body.id_type_article = typeId;
    }
    return next();
  } catch (error) {
    return handleError(_res, error, 'fournituresTypeFilter');
  }
};

router.get('/', authenticate, injectTypeFilter, getArticlesCatalogue);
router.post('/', authenticate, injectTypeFilter, createArticleCatalogue);
router.get('/:id(\\d+)', authenticate, getArticleCatalogueById);
router.put('/:id(\\d+)', authenticate, updateArticleCatalogue);
router.delete('/:id(\\d+)', authenticate, deleteArticleCatalogue);

export default router;
